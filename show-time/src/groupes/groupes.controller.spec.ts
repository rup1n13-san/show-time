import { Test, TestingModule } from '@nestjs/testing';
import { GroupesController } from './groupes.controller';
import { GroupesService } from './groupes.service';

describe('GroupesController', () => {
  let controller: GroupesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupesController],
      providers: [GroupesService],
    }).compile();

    controller = module.get<GroupesController>(GroupesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
