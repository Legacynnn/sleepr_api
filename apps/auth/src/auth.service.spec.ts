import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UserDocument } from './users/models/user.schema';

const user: UserDocument = {
  _id: new Types.ObjectId('64a43e4138a68f509201139d'),
  email: 'test@example.com',
  password: 'strong123',
};

describe('AuthService', () => {
  let sut: AuthService;
  let mockConfigService: ConfigService;
  let mockJwtService: JwtService;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(''),
    } as unknown as ConfigService;

    mockJwtService = {
      sign: jest.fn().mockReturnValue(''),
    } as unknown as JwtService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    sut = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('login', () => {
    it('should set the Authentication cookie with a valid token', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      sut.login(user, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date),
        }),
      );
    });
  });
});
