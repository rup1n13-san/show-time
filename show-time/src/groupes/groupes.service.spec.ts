import { Test, TestingModule } from '@nestjs/testing';
import { GroupesService } from './groupes.service';

describe('GroupesService', () => {
  let service: GroupesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupesService],
    }).compile();

    service = module.get<GroupesService>(GroupesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
