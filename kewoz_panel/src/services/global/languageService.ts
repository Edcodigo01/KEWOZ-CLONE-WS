import { BaseApiService } from "@/services/api/baseApi";
import { API_CONFIG } from "@/config/api";

export type LanguageListParams = {
  page?: number;
  limit?: number;
};

export type LanguageItem = {
  language_id?: number | undefined;
  language_alignment: "RTL" | "LTR" | undefined;
  language: string;
  language_short?: string;
  country: string | undefined;
  status?: boolean;
  default_status?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LanguageListResponse = {
  status: boolean;
  data: {
    Records: LanguageItem[];
    pagination: {
      total_pages: number;
      total_records: number;
      current_page: number;
      records_per_page: number;
    };
  };
  message?: string;
  toast?: boolean;
};

export interface WordListWithTranslationResponse {
  status: boolean;
  data: WordListWithTranslationResponseData;
  message: string;
  toast: boolean;
}

export interface WordListWithTranslationResponseData {
  Records: WordListWithTranslationResponseRecord[];
}

export interface WordListWithTranslationResponseRecord {
  key_id: number;
  key: string;
  Translation: string;
  dirty?: boolean;

}


export interface SingleWordTranslationResponse {
  status: boolean;
  data: object;
  message: string;
  toast: boolean;
}

export interface UpdateWordTranslationResponse {
  status: boolean;
  data: UpdateWordTranslationData;
  message: string;
  toast: boolean;
}

export interface UpdateWordTranslationData {
  translatedValue: string;
}
export interface TranslateAllKeywordsResponse {
  status: boolean;
  data: { [key: string]: string };
  message: string;
  toast: boolean;
}


class LanguageService extends BaseApiService {
  constructor() {
    super("");
  }

  async getLanguageList(
    params: LanguageListParams = {}
  ): Promise<LanguageListResponse> {
    const queryParams = new URLSearchParams({
      page: String(params.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE),
      limit: String(params.limit ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE),
    });
    return this.post<LanguageListResponse, LanguageListResponse>(
      `/language/get-language`,
      {
        page: String(params.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE),
        limit: String(params.limit ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE),
      }
    );
  }

  async editLanguage(language_id: any, data: any) {
    console.log(language_id, data);

    return this.post<any, any>("admin/update-language", {
      language_id,
      ...data,
    });
  }
  async getWordListWithTranslation(language_id: any, ) {
    console.log(language_id);

    return this.post<WordListWithTranslationResponse, WordListWithTranslationResponse>("language/get-language-words", {
      language_id:language_id,
    });
  }

  async translateAWord(language_id: number , key_id : number , key:string) {

    return this.post<SingleWordTranslationResponse, SingleWordTranslationResponse>("admin/translate-single-keyword", {
      language_id: language_id,
      key_id: key_id,
      key: key,
    });
  }
  async translateAllWord(language_id: number) {

    return this.post<TranslateAllKeywordsResponse, TranslateAllKeywordsResponse>("admin/translate-all-keywords", {
      language_id: language_id,
     
    });
  }
  async updateAWord(language_id: number, key_id: number, key: string) {

    return this.post<UpdateWordTranslationResponse, UpdateWordTranslationResponse>("admin/manual-edit-keyword", {
      language_id: language_id,
      key_id: key_id,
      key: key,
    });
  }
  async addLanguage(language: LanguageItem): Promise<any> {
    return this.post<any, any>("/admin/add-language", language);
  }
}

export const languageService = new LanguageService();
