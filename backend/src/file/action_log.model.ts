import { File } from './model';

export class ActionLog {
  public id: number;
  public action: string;
  
  public file: File;
  public timestamp: Date;
  public actionerId: number;

  constructor(
    action: string,
    
    file: File,
    actionerId: number,
    id?: number,
    timestamp?: Date,
  ) {
    this.id = id;
    this.action = action;
    
    this.file = file;
    this.actionerId = actionerId;
    this.timestamp = timestamp || new Date();
  }
}