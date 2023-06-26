import { IsEmail, IsNotEmpty } from "class-validator";

export class GetId{
    @IsNotEmpty()
    @IsEmail()
    email: string
}