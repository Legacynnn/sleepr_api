import { Test, TestingModule } from '@nestjs/testing';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';

const reservationArray = [
  {
    _id: '64a345f5868c829c2a4bb644',
    timestamp: '2023-07-03T22:04:37.725Z',
    startDate: '2022-12-20T03:00:00.000Z',
    endDate: '2022-12-25T03:00:00.000Z',
    userId: '123',
    placeId: '123',
    invoiceId: '493',
  },
  {
    _id: '64a34626868c829c2a4bb646',
    timestamp: '2023-07-03T22:05:26.320Z',
    startDate: '2021-12-20T03:00:00.000Z',
    endDate: '2021-12-25T03:00:00.000Z',
    userId: '123',
    placeId: '456',
    invoiceId: '987',
  },
];

const oneReservation = reservationArray[0];

describe('ReservationsService', () => {
  let sut: ReservationsService;
  let repository: ReservationsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: {
            create: jest.fn().mockReturnValueOnce(oneReservation),
            find: jest.fn().mockResolvedValueOnce(reservationArray),
            findOne: jest.fn().mockResolvedValueOnce(oneReservation),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn().mockResolvedValueOnce(oneReservation),
          },
        },
      ],
    }).compile();

    sut = module.get<ReservationsService>(ReservationsService);
    repository = module.get<ReservationsRepository>(ReservationsRepository);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create a new reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        startDate: new Date('2022-12-20T03:00:00.000Z'),
        endDate: new Date('2022-12-25T03:00:00.000Z'),
        placeId: '456',
        invoiceId: '987',
      };

      const result = await sut.create(createReservationDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createReservationDto,
        timestamp: expect.any(Date),
        userId: '123',
      });
      expect(repository.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual(oneReservation);
    });
  });

  describe('findAll', () => {
    it('should be able to return all reservations', async () => {
      const result = await sut.findAll();

      expect(repository.find).toHaveBeenCalledWith({});
      expect(repository.find).toHaveBeenCalledTimes(1);

      expect(result).toEqual(reservationArray);
    });
  });

  describe('findOne', () => {
    it('should be able to return to find a reservation by id ', async () => {
      const result = await sut.findOne(oneReservation._id);

      expect(repository.findOne).toHaveBeenCalledWith({
        _id: oneReservation._id,
      });
      expect(repository.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(oneReservation);
    });
  });
  describe('update', () => {
    it('should update a reservation', async () => {
      const reservationId = oneReservation._id;
      const updateReservationDto: UpdateReservationDto = {
        invoiceId: '789',
      };

      const updatedReservation: any = { ...oneReservation };

      jest
        .spyOn(repository, 'findOneAndUpdate')
        .mockResolvedValueOnce(updatedReservation);

      const result = await sut.update(reservationId, updateReservationDto);

      expect(repository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: reservationId },
        { $set: updateReservationDto },
      );

      expect(result).toEqual(updatedReservation);
    });
  });

  describe('delete', () => {
    it('should delete a reservation', async () => {
      const result = sut.remove(oneReservation._id);

      expect(repository.findOneAndDelete).toHaveBeenCalledTimes(1);
      expect(repository.findOneAndDelete).toHaveBeenCalledWith({
        _id: oneReservation._id,
      });
      expect(result).toEqual(result);
    });
  });
});
