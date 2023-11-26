interface IResponseBasic {
  error: string;
  errorCode: string;
  success: boolean;
}

interface IResponseWithData<T> extends IResponseBasic {
  data: T;
}

export { IResponseBasic, IResponseWithData };
