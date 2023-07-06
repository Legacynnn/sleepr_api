import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { GetUserDto } from './dto/get-user.dto';
import { UserDocument } from './models/user.schema';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const user = {
  email: 'test@example.com',
  password: '@Strong123',
};

const fullUser = {
  _id: '64a49d6b09769f4547d98d3a',
  email: 'test2@example.com',
  password: '$2a$05$IuGBj387iC9MyYGHoxuyEuUWv6graEzUfkAqOwEI5rOrKWF4BN8.S',
};

describe('UsersService', () => {
  let sut: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn().mockReturnValueOnce(user),
            findOne: jest.fn().mockResolvedValueOnce(fullUser),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn().mockResolvedValueOnce(user),
          },
        },
      ],
    }).compile();

    sut = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createdUser = await sut.create(user);

      expect(repository.create).toHaveBeenCalledWith({
        ...user,
        password: expect.any(String),
      });
      expect(createdUser).toEqual(user);
    });
  });

  describe('verifyUser', () => {
    it('should verify user credentials', async () => {
      const result = await sut.verifyUser(user.email, user.password);

      expect(repository.findOne).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(result).toEqual(fullUser);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const user: UserDocument = {
        _id: new Types.ObjectId('64a43e4138a68f509201139d'),
        email: 'test@example.com',
        password: await bcrypt.hash('strong123', 5),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(user);

      await expect(sut.verifyUser(user.email, user.password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({ email: user.email });
    });
  });

  describe('getUser', () => {
    it('should get user by id', async () => {
      const userId: GetUserDto = { _id: fullUser._id };

      const result = await sut.getUser(userId);

      expect(repository.findOne).toHaveBeenCalledWith(userId);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(fullUser);
    });
  });
});
