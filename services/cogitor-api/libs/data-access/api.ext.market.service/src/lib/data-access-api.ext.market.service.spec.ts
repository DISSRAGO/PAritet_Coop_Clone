import { dataAccessApiExtMarketService } from './data-access-api.ext.market.service';

describe('dataAccessApiExtMarketService', () => {
  it('should work', () => {
    expect(dataAccessApiExtMarketService()).toEqual(
      'data-access-services.ext.market.service'
    );
  });
});
