import { Exclude } from 'class-transformer';

export class User {
  id: string;

  name: string;

  email: string;

  @Exclude()
  password: string;

  createdAt: Date;

  updatedAt: Date;

  //*todo
  exchanges?: any[]; // Will be properly typed when Exchange entity is created
}
