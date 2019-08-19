import { TestBed, inject } from '@angular/core/testing';

import { DownloadApiService } from './download-api.service';

describe('DownloadApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DownloadApiService]
    });
  });

  it('should be created', inject([DownloadApiService], (service: DownloadApiService) => {
    expect(service).toBeTruthy();
  }));
});
