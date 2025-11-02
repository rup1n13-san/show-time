import { Test, TestingModule } from '@nestjs/testing';
import { SeeLaterController } from './see-later.controller';
import { SeeLaterService } from './see-later.service';

describe('SeeLaterController', () => {
  let controller: SeeLaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeeLaterController],
      providers: [SeeLaterService],
    }).compile();

    controller = module.get<SeeLaterController>(SeeLaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
