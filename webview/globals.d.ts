declare global {
  const tsvscode: {
    postMessage: (params: { command: string; value: any }) => void;
  };
}

export {};
