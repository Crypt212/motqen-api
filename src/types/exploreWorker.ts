import { User } from '../domain/user.entity.js';
import { Location } from '../domain/location.entity.js';
import { City } from 'src/domain/government.entity.js';
import { Portfolio, WorkerProfile } from 'src/domain/workerProfile.entity.js';
import { ProjectImage } from 'src/generated/prisma/client.js';

type user = Pick<User, 'id' | 'isOnline' | 'profileImageUrl'>;
type location = Pick<Location, 'id' | 'address' | 'addressNotes'>;

type workInfo = Omit<WorkerProfile, 'createdAt' | 'updatedAt' | 'userId' | 'id'>;
type areaInfo = Pick<City, 'id' | 'name' | 'nameAr' | 'long' | 'lat'>;

export interface ExploreWorkerPublicDetail {
  userInfo: user & { name: string };

  location: location & {
    city: areaInfo;
    government: areaInfo;
  };

  portfolio: {
    id: string;
    mainImage: string | null;
  };
  workInfo: workInfo;
}
