import { PrismaService } from './prisma.service';

// Set NODE_ENV to test before importing
process.env.NODE_ENV = 'test';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect on module init', async () => {
      const $connect = jest.spyOn(service, '$connect' as any).mockResolvedValue(undefined);

      await service.onModuleInit();

      expect($connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect on module destroy', async () => {
      const $disconnect = jest.spyOn(service, '$disconnect' as any).mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect($disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanDatabase', () => {
    it('should have cleanDatabase method', () => {
      expect(service.cleanDatabase).toBeDefined();
      expect(typeof service.cleanDatabase).toBe('function');
    });

    it('should not throw in test environment', () => {
      expect(() => service.cleanDatabase()).not.toThrow();
    });
  });
});
