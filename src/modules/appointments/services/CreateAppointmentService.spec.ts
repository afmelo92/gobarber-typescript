import AppError from '@shared/errors/AppError';

import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeCacheProvider: FakeCacheProvider;
let fakeNotificationsRepository: FakeNotificationsRepository;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();
    fakeCacheProvider = new FakeCacheProvider();
    createAppointment = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to create a new appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    const appointment = await createAppointment.execute({
      date: new Date(2020, 10, 10, 13),
      user_id: 'USER-ID',
      provider_id: 'PROVIDER-ID',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('PROVIDER-ID');
  });

  it('should not be able to create two appointments at the same time', async () => {
    const appointmentDate = new Date(2020, 10, 28, 16);

    await createAppointment.execute({
      date: appointmentDate,
      user_id: 'USER-ID',
      provider_id: 'PROVIDER-ID',
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 10, 28, 16),
        user_id: 'USER-ID',
        provider_id: 'PROVIDER-ID',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create appointments with past dates', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 10, 10, 11),
        user_id: 'USER-ID',
        provider_id: 'PROVIDER-ID',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 10, 10, 13),
        user_id: 'USER-ID',
        provider_id: 'USER-ID',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create appointment outer time limits', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 10, 10, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 10, 11, 4),
        user_id: 'USER-ID',
        provider_id: 'PROVIDER-ID',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointment.execute({
        date: new Date(2020, 10, 11, 19),
        user_id: 'USER-ID',
        provider_id: 'PROVIDER-ID',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
