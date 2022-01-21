import { v4 as uuidv4 } from "uuid";

export class User {
  private static keyUserId = "userid";

  private id: string;

  constructor() {
    const id = localStorage.getItem(User.keyUserId);

    if (id) {
      this.id = id;
    } else {
      const id = uuidv4();
      localStorage.setItem(User.keyUserId, id);
      this.id = id;
    }
  }

  get userId(): string {
    return this.id;
  }
}
