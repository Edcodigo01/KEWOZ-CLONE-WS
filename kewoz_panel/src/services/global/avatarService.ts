import { BaseApiService } from "@/services/api/baseApi";

export type AvatarUploadParams = {
  name: string;
  avatar_gender: "male" | "female" | "other";
  pictureType: "avatar" | "profile" | "custom";
  files: File;
};

export type AvatarUpdateParams = {
  avatar_id: number;
  name: string;
  avatar_gender: "male" | "female" | "other";
  pictureType: "avatar" | "profile" | "custom";
  files?: File | undefined;
};

export type AvatarUploadResponse = {
  status: boolean;
  data: {
    id: string;
    name: string;
    avatar_gender: string;
    pictureType: string;
    file_url: string;
    createdAt: string;
  };
  message: string;
  toast?: boolean;
};

export type Avatar = {
  avatar_id: number;
  name: string;
  avatar_gender: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  avatar_media: string;
};

export type AvatarListResponse = {
  status: boolean;
  data: {
    Records: Avatar[];
  };
  message: string;
};

class AvatarService extends BaseApiService {
  constructor() {
    super("avatar");
  }

  async uploadAvatar(
    params: AvatarUploadParams
  ): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append("name", params.name);
    formData.append("avatar_gender", params.avatar_gender);
    formData.append("pictureType", params.pictureType);
    formData.append("files", params.files);

    return this.post<AvatarUploadResponse, AvatarUploadResponse, FormData>(
      "/add-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async getAvatarList(): Promise<AvatarListResponse> {
    return this.get<AvatarListResponse>("/get-all-avatars");
  }

  async updateAvatar(
    params: AvatarUpdateParams
  ): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append("name", params.name);
    formData.append("avatar_gender", params.avatar_gender);
    formData.append("pictureType", params.pictureType);
    formData.append("avatar_id", params.avatar_id.toString());

    if (params.files) {
      formData.append("files", params.files);
    }

    return this.post<AvatarUploadResponse, AvatarUploadResponse, FormData>(
      "/update-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async deleteAvatar(
    avatarId: number
  ): Promise<{ status: boolean; message: string; deleted_count: number }> {
    const formData = new FormData();
    formData.append("avatar_id", avatarId.toString());

    return this.post<
      { status: boolean; message: string; deleted_count: number },
      { status: boolean; message: string; deleted_count: number },
      FormData
    >("/delete-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export const avatarService = new AvatarService();
