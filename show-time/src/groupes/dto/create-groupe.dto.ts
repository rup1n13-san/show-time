import {IsString, MinLength} from 'class-validator'
export class CreateGroupeDto {
    @IsString()
    @MinLength(3)
    nom: string;
}
