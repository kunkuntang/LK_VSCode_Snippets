declare global {
  type PostMessageParams  = { command: string; value?: any }
  const tsvscode: {
    postMessage: (params: PostMessageParams) => void;
  };
}

export {};
// _vSEbyS3yqofe6E9W9Dh
