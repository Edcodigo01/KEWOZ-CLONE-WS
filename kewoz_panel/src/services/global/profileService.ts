import { BaseApiService } from "@/services/api/baseApi";

export type ProfileData = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  mobile_num: string;
  date_of_birth: string;
  gender: "Male" | "Female";
  profile_pic: string;
  full_name: string;
};

export type ProfileResponse = {
  status: boolean;
  data: ProfileData;
  message: string;
  toast?: boolean;
};

export type UpdateProfileRequest = {
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  mobile_num: string;
  date_of_birth: string;
  gender: "Male" | "Female";
  profile_pic?: File;
};

export type UpdatePasswordRequest = {
  current_password: string;
  password: string;
  confirm_password: string;
};

export type UpdateProfileResponse = {
  status: boolean;
  data: ProfileData;
  message: string;
  toast?: boolean;
};

class ProfileService extends BaseApiService {
  constructor() {
    super("");
  }

  async getProfile(): Promise<ProfileResponse> {
    return this.get<ProfileResponse, ProfileResponse>("/admin");
  }

  async updateProfile(
    profileData: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    // If there's a profile picture, use FormData
    if (profileData.profile_pic) {
      const formData = new FormData();
      formData.append("first_name", profileData.first_name);
      formData.append("last_name", profileData.last_name);
      formData.append("email", profileData.email);
      formData.append("country_code", profileData.country_code);
      formData.append("mobile_num", profileData.mobile_num);
      formData.append("pictureType", "profile_pic");
      formData.append("files", profileData.profile_pic);

      return this.put<FormData, UpdateProfileResponse>("/admin", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Regular JSON update without profile picture
    const { profile_pic, ...jsonData } = profileData;
    return this.put<
      Omit<UpdateProfileRequest, "profile_pic">,
      UpdateProfileResponse
    >("/admin", jsonData);
  }

  async updatePassword(
    profileData: UpdatePasswordRequest
  ): Promise<UpdateProfileResponse> {
    const formData = new FormData();
    formData.append("current_password", profileData.current_password);
    formData.append("password", profileData.password);
    formData.append("confirm_password", profileData.confirm_password);
    return this.put<FormData, UpdateProfileResponse>("/admin", formData);
  }
}

export const profileService = new ProfileService();
