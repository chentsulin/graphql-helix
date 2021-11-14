// @denoify-ignore
import type { ServerResponse } from "http";
import type { Http2ServerResponse } from "http2";

export type NodeResponse = ServerResponse | Http2ServerResponse;

export async function sendNodeResponse(responseResult: Response, nodeResponse: NodeResponse): Promise<void> {
  const headersObj: any = {};
  responseResult.headers.forEach((value, name) => {
    headersObj[name] = value;
  });
  nodeResponse.writeHead(responseResult.status, headersObj);
  const responseBody: ReadableStream | null = responseResult.body;
  if (responseBody == null) {
    throw new Error("Response body is not supported");
  }
  const reader = responseBody.getReader();
  while(true) {
    const { done, value } = await reader.read();
    if (value) {
      (nodeResponse as any).write(value);
    }
    if (done) {
      nodeResponse.end();
      break;
    }
  }
  nodeResponse.on('close', () => {
    reader.releaseLock();
  })
}
