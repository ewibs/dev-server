import path from 'path';
import { Assembly } from '@ewibs/assembly';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { first, Subscriber, Subscription } from 'rxjs';

import { DevServerConfig } from './models/config';

export class DevServer {
  private readonly server: Server;
  private readonly sub: Subscription;

  get Address(): string { return `http://localhost:${this.Port}/${this.assembly.settings.base || ''}` }
  get Port(): number { return this.config.port || 8080; }

  constructor(
    private readonly assembly: Assembly,
    private readonly config: DevServerConfig = {}
  ) {
    this.server = createServer((req, res) => this.response(req, res));
    this.server.listen(this.Port);

    this.sub = this.assembly.$load.pipe(first()).subscribe(() => {
      console.log(`Started ewibs dev server on ${this.Address}`);
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
    const base = `/${this.assembly.settings.base || ''}`;
    if (!req.url?.startsWith(base)) {
      res.writeHead(404);
      res.end(`Invalid url base of url ${req.url}. Needs to start with ${base}`);
      return;
    }

    const fileNormalized = path.relative(base.slice(1), req.url.slice(1));
    const file = this.tryGettingFile(fileNormalized);

    if (!file) {
      res.writeHead(404);
      res.end(`Couldn't find '${fileNormalized}'`);
      return;
    }
    res.writeHead(200);
    res.end(file);
  }

  destroy() {
    this.server.close();
    this.sub.unsubscribe();
  }
}