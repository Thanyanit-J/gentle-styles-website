import { Component, input, signal, ViewChild, ElementRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-product-carousel',
  imports: [],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.css',
})
export class ProductCarousel implements OnInit {
  @ViewChild('mainDisplay') carouselContainer!: ElementRef<HTMLElement>;
  @ViewChild('thumbnailContainer') thumbnailContainer!: ElementRef<HTMLElement>;
  /**
   * Image URLs to display in the carousel
   */
  imageURLs = input<string[]>([]);

  /**
   * Product names to display in case of image not found
   */
  productName = input<string>('');

  // Index of the current displayed image in the main display
  currentImageIndex = signal(0);

  protected deviceType = signal<'mobile' | 'desktop'>('desktop');
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.detectMobileDevice();
    }
  }

  detectMobileDevice() {
    const userAgent = navigator.userAgent;

    // Default to desktop view (show arrows)
    if (!userAgent) {
      return this.deviceType.set('desktop');
    }

    // Regex to check for mobile devices
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

    this.deviceType.set(mobileRegex.test(userAgent) ? 'mobile' : 'desktop');
  }

  // Ensure the selected thumbnail is visible in the scroll container
  scrollToThumbnail(index: number) {
    if (!this.thumbnailContainer) return;

    const container = this.thumbnailContainer.nativeElement;
    const thumbnail = document.getElementById(`thumbnail-${index}`);

    if (container && thumbnail) {
      // Get the positions and dimensions
      const containerRect = container.getBoundingClientRect();
      const thumbnailRect = thumbnail.getBoundingClientRect();

      // Check if the thumbnail is not fully visible
      const isNotFullyVisible = thumbnailRect.left < containerRect.left || thumbnailRect.right > containerRect.right;

      if (isNotFullyVisible) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  // Methods for horizontal scrolling carousel
  scrollToImage(index: number) {
    this.currentImageIndex.set(index);

    if (!this.carouselContainer) return;

    const carousel = this.carouselContainer.nativeElement;
    const images = carousel?.querySelectorAll('[id^="carousel-image-"]');

    if (carousel && images?.length > index) {
      const targetImage = images[index] as HTMLElement;
      targetImage.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      this.scrollToThumbnail(index);
    }
  }

  scrollToNextImage() {
    if (this.imageURLs().length === 0) return;

    const nextIndex = (this.currentImageIndex() + 1) % this.imageURLs().length;
    this.scrollToImage(nextIndex);
  }

  scrollToPrevImage() {
    if (this.imageURLs().length === 0) return;

    const prevIndex = this.currentImageIndex() === 0 ? this.imageURLs().length - 1 : this.currentImageIndex() - 1;
    this.scrollToImage(prevIndex);
  }

  updateCurrentImageOnScroll(event: Event) {
    if (this.imageURLs().length <= 1) return;

    const carousel = event.target as HTMLElement;
    const scrollPosition = carousel.scrollLeft;
    const mainDisplayWidth = carousel.clientWidth;

    // Calculate which image is most visible
    const imageIndex = Math.round(scrollPosition / mainDisplayWidth);

    // Only update if the index changed
    if (imageIndex !== this.currentImageIndex() && imageIndex >= 0 && imageIndex < this.imageURLs().length) {
      this.currentImageIndex.set(imageIndex);
      this.scrollToThumbnail(imageIndex);
    }
  }
}
