import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadZipComponent } from './download-zip.component';

describe('DownloadZipComponent', () => {
  let component: DownloadZipComponent;
  let fixture: ComponentFixture<DownloadZipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadZipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadZipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
