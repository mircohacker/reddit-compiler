import base64
import datetime
import io
import logging
import re
from typing import List, Union

from ebooklib import epub
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from praw.exceptions import ClientException
from praw.reddit import Submission
from pydantic import BaseModel, HttpUrl, Field
from reddit2epub.reddit2epubLib import get_chapters_from_anchor, reddit, create_book_from_chapters
from starlette.requests import Request
from starlette.responses import JSONResponse


app = FastAPI(title="Reddit compiler API",
              description="This API can be used to compile multiple reddit text posts into one epub file.",
              version="1.0.0")


async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logging.exception(e)
        return JSONResponse(
            status_code=500,
            content={"detail": f"There goes a rainbow... Oops! {e.__class__} >> \n{e}"},
        )


app.middleware('http')(catch_exceptions_middleware)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ErrorResponse(BaseModel):
    detail: Union[str, dict]


class Chapter(BaseModel):
    id: str = Field(
        description="The fullname of the chapter. Is equivalent to the fullname of the represented reddit chapter. "
                    "ATTENTION: fullname != id. Fullnames contain a tx_ prefix where x denotes the type of the "
                    "referenced object. This API currently only supports t3_ prefixes. Other types are ignored but "
                    "may be supported in the future.")
    title: str
    snippet: str = Field(description="The first 2500 characters of the post. Formatted in markdown")
    date: datetime.datetime = Field(description="The date of the reddit post")
    original_link: HttpUrl = Field(description="The short URL of the represented reddit post")


class ChapterOverview(BaseModel):
    author: str = Field(description="The author of all the chapters")
    search_term: str = Field(description="The string used to search for the chapters")
    chapters: List[Chapter]


class BookResult(BaseModel):
    fileName: str = Field(
        description="The filename proposed by the API. Consists of only alphanumeric characters and underscores.")
    content: str = Field(description="Contains the base64 encoded contents of the generated epub")
    mimeType: str = Field("application/epub+zip")


@app.get("/pong")
def ping():
    """
    simple ping endpoint...
    """
    return {"pong": "ping"}


@app.get("/")
def root():
    return {"message": "Congrats the api works. 😁 Head over to /docs to see how it works"}


@app.get("/chapters", response_model=ChapterOverview, responses={
    400: {
        "model": ErrorResponse
    }
})
def get_chapters(url: HttpUrl = Query(..., description="The Reddit URL of one of the chapters",
                                      example="https://www.reddit.com/r/HFY/comments/flx9ae/the_galactic_archives_present_humanity_part_2/"),
                 search_term_length: int = Query(2, ge=0,
                                                 description="How many words from the start of the "
                                                             "given chapter should be used as search term. "
                                                             "Zero includes all posts of the author in the "
                                                             "given subreddit."),
                 all_reddit: bool = Query(False,
                                          description="Chapter should be searched in all of reddit. False means to "
                                                      "only search in the subreddit of the given chapter")
                 ):
    """
        This Endpoint obtains a list of posts by the given author. Posts are filtered by a prefix of the title and
        subreddit. Both are configurable.
    """
    try:
        author, reddit_chapters, search_term = get_chapters_from_anchor(input_url=url,
                                                                        overlap=search_term_length,
                                                                        all_reddit=all_reddit)
    except ClientException as e:
        raise HTTPException(status_code=400,
                            detail="Could not obtain data from reddit. Error was [{}]".format(e)) from e

    chapters = []

    for reddit_chapter in reversed(reddit_chapters):
        chapters.append(
            Chapter(
                id=reddit_chapter.fullname,
                title=reddit_chapter.title,
                snippet=reddit_chapter.selftext[:2500],
                date=reddit_chapter.created_utc,
                original_link=reddit_chapter.shortlink,
            ))

    result = ChapterOverview(author=author.name, search_term=search_term, chapters=chapters)
    return result


@app.get("/epub", response_model=BookResult)
def get_epub(ids: List[str] = Query(...,
                                    # This alias is used to obtain compatibility with axios list marshalling and php multi values
                                    alias="ids[]",
                                    description="The sorted list of chapter fullnames for the epub")):
    """
    This endpoint can be used to get the finalised epub file.
    """
    chapters = list(reddit.info(fullnames=ids))

    # currently only submissions are allowed
    chapters = [c for c in chapters if type(c) == Submission]

    book_author = chapters[0].author.name
    book_title = chapters[0].title
    file_name = (re.sub('[^0-9a-zA-Z]+', '_', book_title) + ".epub").strip("_OC")
    book_id = str(hash(str((ids, book_author, book_title))))

    book = create_book_from_chapters(book_author, book_id, book_title, chapters)

    with io.BytesIO() as output:
        # write to the file
        epub.write_epub(output, book, {})

        return BookResult(content=(base64.b64encode(output.getvalue())), fileName=file_name)
