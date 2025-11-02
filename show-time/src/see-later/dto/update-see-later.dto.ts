import { PartialType } from '@nestjs/mapped-types';
import { CreateSeeLaterDto } from './create-see-later.dto';

export class UpdateSeeLaterDto extends PartialType(CreateSeeLaterDto) {}
