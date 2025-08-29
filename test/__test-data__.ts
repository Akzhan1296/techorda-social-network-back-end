import { AuthRegistrationInputModal } from "../src/features/roles/public/auth/api/auth.models";
import { Request, Response } from "express";
import { add } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  CreateBlogInputModelType,
  CreatePostInputType,
} from "../src/features/roles/sa/blogs/api/sa.blogs.models";

export const mockRequest = {
  headers: {
    "user-agent": "device name",
  },
} as unknown as Request;

export const mockResponse = {
  cookie: jest.fn(),
  status: jest.fn(() => mockResponse),
  send: jest.fn(() => true),
} as unknown as Response;

export const registrationUser: AuthRegistrationInputModal = {
  login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
    0,
    10,
  ),
  password: "password",
  email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
} as const;

export const userByEmailMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
  registrationId: uuidv4(),
  userId: uuidv4(),
  email: "test@test.com",
} as const;

export const userByConfirmCodeMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: uuidv4(),
  registrationId: uuidv4(),
  userId: uuidv4(),
} as const;

export const creatingBlogMock: CreateBlogInputModelType = {
  name: "blog name",
  websiteUrl: "https://www.youtube.com",
  description: "some description",
};

export const createPostMock: CreatePostInputType = {
  title: "post title",
  shortDescription: "shortDescription",
  content: "content",
};
