import { api } from '../../../lib/axios';

// Types
export interface TeacherSchedule {
  id: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxStudents: number | null;
  teacher: {
    id: string;
    user: {
      fullName: string;
      email: string;
      sex: string;
    };
  };
}

export interface BlockedDate {
  id: string;
  teacherId: string | null;
  date: string;
  reason: string | null;
  createdBy: string | null;
  teacher?: {
    id: string;
    user: {
      fullName: string;
    };
  } | null;
}

export interface CreateScheduleDto {
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  maxStudents?: number;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {}

export interface BlockDateDto {
  teacherId?: string;
  date: string;
  reason?: string;
}

export interface BulkScheduleDto {
  teacherId: string;
  schedules: Omit<CreateScheduleDto, 'teacherId'>[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API methods
const teacherSchedulesApi = {
  // Get all schedules with pagination
  getAllSchedules: async (params?: {
    page?: number;
    limit?: number;
    teacherId?: string;
    isAvailable?: boolean;
  }): Promise<PaginatedResponse<TeacherSchedule>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
    if (params?.isAvailable !== undefined)
      queryParams.append('isAvailable', params.isAvailable.toString());

    const response = await api.get(
      `/admin/teacher-schedules?${queryParams.toString()}`,
    );
    return response.data.data;
  },

  // Get schedules for a specific teacher
  getTeacherSchedules: async (teacherId: string): Promise<TeacherSchedule[]> => {
    const response = await api.get(`/admin/teacher-schedules/${teacherId}`);
    return response.data.data;
  },

  // Get a single schedule by ID
  getScheduleById: async (id: string): Promise<TeacherSchedule> => {
    const response = await api.get(`/admin/teacher-schedules/by-id/${id}`);
    return response.data.data;
  },

  // Create a new schedule
  createSchedule: async (dto: CreateScheduleDto): Promise<TeacherSchedule> => {
    const response = await api.post('/admin/teacher-schedules', dto);
    return response.data.data;
  },

  // Bulk create schedules
  bulkCreateSchedules: async (dto: BulkScheduleDto): Promise<TeacherSchedule[]> => {
    const response = await api.post('/admin/teacher-schedules/bulk', dto);
    return response.data.data;
  },

  // Update a schedule
  updateSchedule: async (id: string, dto: UpdateScheduleDto): Promise<TeacherSchedule> => {
    const response = await api.patch(`/admin/teacher-schedules/${id}`, dto);
    return response.data.data;
  },

  // Delete a schedule
  deleteSchedule: async (id: string): Promise<void> => {
    await api.delete(`/admin/teacher-schedules/${id}`);
  },

  // Copy schedules from one teacher to another
  copySchedules: async (fromTeacherId: string, toTeacherId: string): Promise<TeacherSchedule[]> => {
    const response = await api.post(
      `/admin/teacher-schedules/copy/${fromTeacherId}/${toTeacherId}`,
    );
    return response.data.data;
  },

  // Get blocked dates
  getBlockedDates: async (params?: {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
  }): Promise<BlockedDate[]> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId);

    const response = await api.get(
      `/admin/blocked-dates?${queryParams.toString()}`,
    );
    return response.data.data;
  },

  // Block a date
  blockDate: async (dto: BlockDateDto): Promise<BlockedDate> => {
    const response = await api.post('/admin/blocked-dates', dto);
    return response.data.data;
  },

  // Unblock a date
  unblockDate: async (id: string): Promise<void> => {
    await api.delete(`/admin/blocked-dates/${id}`);
  },
};

export { teacherSchedulesApi };
