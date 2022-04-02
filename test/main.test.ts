import { createParser } from '../src';
import path from 'path';
// import schema from './helm/my-chart/values.schema.json';

interface MyChartValues {
  replicaCount: number;
}

const parser = createParser<MyChartValues>({
  chartPath: path.resolve(__dirname, 'helm/my-chart'),
});

describe('main', () => {
  it('can search deployments only', async () => {
    const { deployments } = parser.parse({
      namespace: 'my-namespace',
      releaseName: 'my-release',
      values: {
        replicaCount: 3,
      },
    });

    const deployment = deployments[0];

    expect(deployment.spec.replicas).toEqual(3);
  });
});
