import { Assembly } from '@ewibs/assembly';
import { IComponent } from '@ewibs/assembly/models/component';
import path from 'path';

import { DevServer } from '../dev-server';

// const baseUrl = path.resolve(__dirname, '../examples/simple/simple.ewibs');
const baseUrl = '/Users/simonrothert/pvt-projects/ewibs/website/website.ewibs';

class TestAssembly extends Assembly {

  async removeModuleFromCache(file: string): Promise<void> {
    delete require.cache[file];
  }

  async import(file: string): Promise<IComponent> {
    return await import(file);
  }
}

const assembly = new TestAssembly(baseUrl);

const server = new DevServer(assembly, { port: 8082 });