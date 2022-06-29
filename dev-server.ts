import path from 'path';
import { Assembly } from '@ewibs/assembly';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { first } from 'rxjs';

import { DevServerConfig } from './models/config';

export class DevServer {
  private readonly server: Server;

  constructor(private readonly assembly: Assembly, config: DevServerConfig = {}) {
    this.server = createServer((req, res) => this.response(req, res));
    this.server.listen(8080);
    
    this.assembly.$load.pipe(first()).subscribe(() => {
      console.log('Started ewibs dev server on http://localhost:8080');
    });
  }

  private tryGettingFile(file: string = ''): string | NodeJS.ArrayBufferView | undefined {
    const normal = this.assembly.bundle!.files.get(file);
    if (normal) { return normal; }
    const htmlEd = this.assembly.bundle!.files.get(`${file}.html`);
    if (htmlEd) { return htmlEd; }
    return this.assembly.bundle!.files.get(path.join(file, 'index.html'));
  }

  private response(req: IncomingMessage, res: ServerResponse) {
    if (!this.assembly.bundle) {
      res.writeHead(404);
      res.end('The bundle is still loading');
      return;
    }

    const file = this.tryGettingFile(req.url?.slice(1));

    if (!file) {
      res.writeHead(404);
      res.end(`Couldn't find '${req.url?.slice(1)}'`);
      return;
    }
    res.writeHead(200);
    res.end(file);
  }
}