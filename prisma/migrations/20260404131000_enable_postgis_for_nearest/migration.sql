CREATE EXTENSION IF NOT EXISTS postgis;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'governments'
      AND column_name = 'lat'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'governments'
      AND column_name = 'long'
  ) THEN
    EXECUTE '
      ALTER TABLE "governments"
      ADD COLUMN IF NOT EXISTS "pointGeography" geography(Point, 4326)
      GENERATED ALWAYS AS (
        CASE
          WHEN "lat" ~ ''^-?[0-9]+(\\.[0-9]+)?$''
            AND "long" ~ ''^-?[0-9]+(\\.[0-9]+)?$''
          THEN ST_SetSRID(
            ST_MakePoint(CAST("long" AS double precision), CAST("lat" AS double precision)),
            4326
          )::geography
          ELSE NULL
        END
      ) STORED
    ';

    EXECUTE '
      CREATE INDEX IF NOT EXISTS governments_point_geography_gist_idx
      ON "governments"
      USING GIST ("pointGeography")
      WHERE "pointGeography" IS NOT NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cities'
      AND column_name = 'lat'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cities'
      AND column_name = 'long'
  ) THEN
    EXECUTE '
      ALTER TABLE "cities"
      ADD COLUMN IF NOT EXISTS "pointGeography" geography(Point, 4326)
      GENERATED ALWAYS AS (
        CASE
          WHEN "lat" ~ ''^-?[0-9]+(\\.[0-9]+)?$''
            AND "long" ~ ''^-?[0-9]+(\\.[0-9]+)?$''
          THEN ST_SetSRID(
            ST_MakePoint(CAST("long" AS double precision), CAST("lat" AS double precision)),
            4326
          )::geography
          ELSE NULL
        END
      ) STORED
    ';

    EXECUTE '
      CREATE INDEX IF NOT EXISTS cities_point_geography_gist_idx
      ON "cities"
      USING GIST ("pointGeography")
      WHERE "pointGeography" IS NOT NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'governments_for_workers'
  ) THEN
    EXECUTE '
      CREATE INDEX IF NOT EXISTS governments_for_workers_worker_government_idx
      ON "governments_for_workers" ("workerProfileId", "governmentId")
    ';
  END IF;
END $$;
