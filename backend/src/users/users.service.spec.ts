import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { RendezVous } from '../rendezvous/rendezvous.entity';

const repoMock = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
});


describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof repoMock>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: repoMock },
        { provide: getRepositoryToken(RendezVous), useFactory: repoMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAllByRole', () => {
    it('passes correct query to repository', async () => {
      userRepo.find.mockResolvedValue([]);
      await service.findAllByRole('patient');
      expect(userRepo.find).toHaveBeenCalledWith({
        where: { role: 'patient' },
        select: ['id', 'nom', 'prenom', 'email', 'age', 'lieuNaissance'],
      });
    });
  });
});
