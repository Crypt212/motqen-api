import { User } from "../domain/user.entity.js";
import { Location } from "../domain/location.entity.js";
import { City } from "src/domain/government.entity.js";
import { WorkerProfile } from "src/domain/workerProfile.entity.js";


type user = Pick<User , 'id'|'isOnline'|'profileImageUrl'>
type location = Pick<Location , 'id'|'address'|'addressNotes'>

export type Specialization = {
  id: number;
  name: string;
  nameAr: string;
  subSpecializations: SubSpecialization[];
};
type SubSpecialization = Omit<Specialization,'subSpecializations'>

type workInfo = Omit<WorkerProfile , 'createdAt'|'updatedAt'|'userId'|'id'>
type areaInfo = Pick<City , 'id'|'name'|'nameAr'|'long'|'lat'>

export interface ExploreWorkerPublicDetail {
  userInfo: user & { name: string };

  location: location & {
    city: areaInfo;
    government: areaInfo;
  };

  specializationTree: Specialization[];

  workInfo: workInfo;
}

