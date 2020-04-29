import axios from "axios";
import Axios, {AxiosResponse} from "axios";
import {ChapterOverview} from "../models/chapterOverview";
import config from "../config/config";
import {Chapter} from "../models/chapter";
import {BookResult} from "../models/bookResult";


const getChapters = (chapterUrl: string, searchTermLength: number, searchAllReddit: boolean): Promise<AxiosResponse<ChapterOverview>> => {
    return axios.get(`${config.BACKEND_HOST}/chapters`, {
        params: {
            url: chapterUrl,
            search_term_length: searchTermLength,
            all_reddit: searchAllReddit,
        }
    })
};

const getEpubFromChapters = (chapters: Chapter[]): Promise<AxiosResponse<BookResult>> => {
    const chapter_ids = chapters.map((chapter: Chapter) => (chapter.id));
    return Axios.get(`${config.BACKEND_HOST}/epub`, {
        params: {
            ids: chapter_ids,
        }
    });
};

export const BackendAdapter = {
    getChapters,
    getEpubFromChapters,
};