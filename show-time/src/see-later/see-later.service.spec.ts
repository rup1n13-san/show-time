import { Test, TestingModule } from '@nestjs/testing';
import { SeeLaterService } from './see-later.service';

describe('SeeLaterService', () => {
  let service: SeeLaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeeLaterService],
    }).compile();

    service = module.get<SeeLaterService>(SeeLaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
