import axios from "axios";
import type {
  ListProfilesResponseDto,
  ListFullProfilesResponseDto,
  GetProfileByIdResponseDto,
  UpdateFullProfileRequestDto,
  UpdateFullProfileResponseDto,
} from "../lib/dtos";
import axiosInstance from "@/lib/axiosInstance";
import { ApiResponse } from "@/lib/api.type";

export const ProfileService = {
  async listAll(): Promise<ApiResponse<ListProfilesResponseDto>> {
    const { data } = await axiosInstance.get<ApiResponse<ListProfilesResponseDto>>("/profiles");
    return data;
  },

  async listAllFull(): Promise<ApiResponse<ListFullProfilesResponseDto>> {
    const { data } = await axiosInstance.get<ApiResponse<ListFullProfilesResponseDto>>(
      "/full-profiles"
    );
    return data;
  },

  async getById(profileId: string): Promise<ApiResponse<GetProfileByIdResponseDto>> {
    const { data } = await axiosInstance.get<ApiResponse<GetProfileByIdResponseDto>>(
      `/profiles/${profileId}`
    );
    return data;
  },

  async updateFull(
    profileId: string,
    body: UpdateFullProfileRequestDto
  ): Promise<ApiResponse<UpdateFullProfileResponseDto>> {
    const { data } = await axiosInstance.put<ApiResponse<UpdateFullProfileResponseDto>>(
      `/profiles/${profileId}/full`,
      body
    );
    return data;
  },
};
