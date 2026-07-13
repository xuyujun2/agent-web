<template>
  <main class="booking-page">
    <section class="search-area">
      <div class="search-card">
        <img class="icon-24" :src="iconSearch" alt="" />
        <div class="search-text">
          <p class="city">San Francisco</p>
          <div class="conditions">
            <span>{{ t('search.date') }}</span>
            <img class="dot" :src="dotIcon" alt="" />
            <span>{{ t('search.room') }}</span>
            <img class="dot" :src="dotIcon" alt="" />
            <span>{{ t('search.guests') }}</span>
          </div>
        </div>
        <img class="icon-24 edit-icon" :src="iconEdit" alt="" />
      </div>

      <div class="filter-row">
        <label class="filter-button">
          <select v-model="selectedFilter" class="filter-select" :aria-label="t('filter.aria')">
            <option v-for="option in filterOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <img class="chevron" :src="iconChevron" alt="" />
        </label>
        <label class="filter-button sort-button">
          <select v-model="selectedSort" class="filter-select" :aria-label="t('sort.aria')">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <img class="chevron" :src="iconChevron" alt="" />
        </label>
        <label class="filter-button language-button">
          <select v-model="locale" class="filter-select language-select" :aria-label="t('language.aria')">
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <img class="chevron" :src="iconChevron" alt="" />
        </label>
      </div>
      <p class="results-count">{{ t('results.count', { count: 99 }) }}</p>
    </section>

    <section class="map-area">
      <img class="map-image" :src="mapImage" alt="" />
      <div
        v-for="chip in priceChips"
        :key="chip.id"
        class="price-chip"
        :class="{ selected: chip.selected }"
        :style="{ left: `${chip.x}rem`, top: `${chip.y}rem` }"
      >
        {{ chip.label }}
      </div>
    </section>

    <section class="listing-panel">
      <div class="handle"></div>
      <div class="listing-stack">
        <article v-for="listing in listings" :key="listing.id" class="listing-card">
          <div class="image-carousel">
            <img class="listing-image" :src="listing.image" alt="" />
            <img class="pagination" :src="paginationImage" alt="" />
          </div>
          <div class="listing-info">
            <div class="listing-copy">
              <p class="listing-title">{{ t('listing.name') }}</p>
              <div class="meta-row">
                <span class="meta-item">
                  <img class="icon-16" :src="iconStar" alt="" />
                  {{ t('listing.reviews', { rating: listing.rating, count: listing.reviewCount }) }}
                </span>
                <span class="meta-item">
                  <img class="icon-16" :src="iconMapPin" alt="" />
                  {{ t('listing.distance', { distance: listing.distance }) }}
                </span>
              </div>
            </div>
            <div class="price-row">
              <p class="night-price">
                <span>{{ listing.price }}</span>
                <em>{{ t('listing.perNight') }}</em>
              </p>
              <button class="select-button">{{ t('listing.select') }}</button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <nav class="tab-bar">
      <div class="tabs">
        <img class="tab-icon tab-home muted" :src="iconHome" alt="" />
        <img class="tab-icon tab-calendar" :src="iconCalendar" alt="" />
        <img class="tab-icon tab-trips muted" :src="iconTrips" alt="" />
        <img class="tab-icon tab-heart muted" :src="iconHeart" alt="" />
        <img class="tab-icon tab-person muted" :src="iconPerson" alt="" />
      </div>
      <div class="home-indicator"></div>
    </nav>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import iconPerson from '@/assets/figma-booking/icon-person.svg';
import iconHeart from '@/assets/figma-booking/icon-heart.svg';
import iconCalendar from '@/assets/figma-booking/icon-calendar.svg';
import iconHome from '@/assets/figma-booking/icon-tab-home.svg';
import iconMapPin from '@/assets/figma-booking/icon-map-pin.svg';
import iconChevron from '@/assets/figma-booking/icon-chevron-down-small-fill.svg';
import mapImage from '@/assets/figma-booking/map.png';
import hotelImageOne from '@/assets/figma-booking/hotel-1.png';
import hotelImageTwo from '@/assets/figma-booking/hotel-2.png';
import iconSearch from '@/assets/figma-booking/icon-search.svg';
import dotIcon from '@/assets/figma-booking/dot.svg';
import iconEdit from '@/assets/figma-booking/icon-edit.svg';
import paginationImage from '@/assets/figma-booking/pagination.svg';
import iconStar from '@/assets/figma-booking/icon-star.svg';
import iconTrips from '@/assets/figma-booking/icon-trips.svg';

defineOptions({ name: 'home' });

const { t, locale } = useI18n();

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'EN', value: 'en' },
];

const filterOptions = computed(() => [
  { label: t('filter.all'), value: 'all' },
  { label: t('filter.under150'), value: 'under-150' },
  { label: t('filter.rating48'), value: 'rating-48' },
  { label: t('filter.nearMe'), value: 'near-me' },
]);

const sortOptions = computed(() => [
  { label: t('sort.recommended'), value: 'recommended' },
  { label: t('sort.priceAsc'), value: 'price-asc' },
  { label: t('sort.priceDesc'), value: 'price-desc' },
  { label: t('sort.ratingDesc'), value: 'rating-desc' },
]);

const selectedFilter = ref('all');
const selectedSort = ref('recommended');

const priceChips = [
  { id: 'price-199', label: '$199', x: 3.59, y: 1, selected: false },
  { id: 'price-123', label: '$123', x: 3.6, y: 2.66, selected: true },
  { id: 'price-234', label: '$234', x: 1.23, y: 1.52, selected: false },
  { id: 'price-567', label: '$567', x: 1.02, y: 3.26, selected: false },
  { id: 'price-345', label: '$345', x: 2.57, y: 4.02, selected: false },
  { id: 'price-299', label: '$299', x: 6.41, y: 1.54, selected: false },
  { id: 'price-176', label: '$176', x: 5.97, y: 3.4, selected: false },
];

const listings = [
  {
    id: 'listing-1',
    image: hotelImageOne,
    rating: '4.8',
    reviewCount: 500,
    distance: '1.2',
    price: '$123',
  },
  {
    id: 'listing-2',
    image: hotelImageTwo,
    rating: '4.7',
    reviewCount: 800,
    distance: '1.5',
    price: '$178',
  },
];
</script>

<style scoped lang="less">
.booking-page {
  position: relative;
  width: 7.5rem;
  max-width: 100vw;
  height: 16.24rem;
  margin: 0 auto;
  overflow: hidden;
  background: #ffffff;
  color: #000000;
  font-family: Inter, "Microsoft YaHei", Arial, sans-serif;
}

.search-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.44rem;
  overflow: hidden;
  background: #ffffff;
}

.search-card {
  position: absolute;
  top: 0.16rem;
  left: 0.32rem;
  display: flex;
  align-items: center;
  gap: 0.24rem;
  width: 6.86rem;
  height: 1.28rem;
  padding: 0.16rem 0.32rem 0.16rem 0.24rem;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 0.24rem;
}

.icon-24 {
  display: block;
  width: 0.48rem;
  height: 0.48rem;
  flex: 0 0 0.48rem;
}

.edit-icon {
  transform: scaleY(-1);
}

.search-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.04rem;
  width: 4.94rem;
  height: 0.96rem;
}

.city {
  width: 4.94rem;
  height: 0.48rem;
  overflow: hidden;
  font-size: 0.32rem;
  font-weight: 500;
  line-height: 0.48rem;
  color: #000000;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.conditions {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  height: 0.44rem;
  overflow: hidden;
  font-size: 0.28rem;
  font-weight: 400;
  line-height: 0.44rem;
  color: #828282;
  white-space: nowrap;
}

.dot {
  width: 0.06rem;
  height: 0.06rem;
  flex: 0 0 0.06rem;
}

.filter-row {
  position: absolute;
  top: 1.6rem;
  left: 0.32rem;
  display: flex;
  align-items: center;
  gap: 0.16rem;
  height: 0.68rem;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  height: 0.68rem;
  padding: 0.12rem 0.16rem 0.12rem 0.2rem;
  overflow: hidden;
  font-size: 0.28rem;
  font-weight: 500;
  line-height: 0.44rem;
  color: rgba(0, 0, 0, 0.9);
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 0.12rem;
}

.filter-select {
  max-width: 1.2rem;
  height: 0.44rem;
  overflow: hidden;
  color: inherit;
  font: inherit;
  line-height: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  appearance: none;
}

.sort-button {
  color: #1a1a1a;
}

.language-button {
  width: 1.28rem;
  padding-right: 0.12rem;
}

.language-select {
  max-width: 0.72rem;
}

.chevron {
  width: 0.36rem;
  height: 0.36rem;
}

.results-count {
  position: absolute;
  top: 1.72rem;
  right: 0.32rem;
  width: 1.32rem;
  height: 0.44rem;
  overflow: hidden;
  font-size: 0.28rem;
  font-weight: 400;
  line-height: 0.44rem;
  color: rgba(0, 0, 0, 0.9);
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.map-area {
  position: absolute;
  top: 2.44rem;
  left: 0;
  width: 100%;
  height: 5.44rem;
  overflow: hidden;
  background: #fafcff;
}

.map-image {
  position: absolute;
  top: 0;
  left: -0.66rem;
  width: 8.84rem;
  height: 8.84rem;
  object-fit: cover;
}

.price-chip {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0.56rem;
  padding: 0.16rem 0.24rem;
  font-size: 0.26rem;
  font-weight: 500;
  line-height: 0.351rem;
  color: #1b2228;
  white-space: nowrap;
  background: #fcfeff;
  border-radius: 0.48rem;
  box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.08);
  transform: translate(-50%, -50%);
}

.price-chip.selected {
  color: #ffffff;
  background: rgba(0, 0, 0, 0.9);
  box-shadow: none;
}

.listing-panel {
  position: absolute;
  top: 7.4rem;
  left: 0;
  width: 100%;
  height: 6.4rem;
  overflow: hidden;
  background: #ffffff;
  border-radius: 0.48rem 0.48rem 0 0;
}

.handle {
  position: absolute;
  top: 0.24rem;
  left: 3.28rem;
  width: 0.96rem;
  height: 0.08rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2rem;
}

.listing-stack {
  position: absolute;
  top: 0.48rem;
  left: 0.32rem;
  display: flex;
  flex-direction: column;
  gap: 0.64rem;
  width: 6.88rem;
}

.listing-card {
  position: relative;
  width: 6.88rem;
  height: 4.68rem;
  flex: 0 0 4.68rem;
}

.image-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 6.88rem;
  height: 3rem;
  overflow: hidden;
  border-radius: 0.16rem;
}

.listing-image {
  width: 6.88rem;
  height: 3rem;
  object-fit: cover;
}

.pagination {
  position: absolute;
  bottom: 0.16rem;
  left: 2.99rem;
  width: 0.9rem;
  height: 0.1rem;
}

.listing-info {
  position: absolute;
  top: 3.24rem;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  width: 6.88rem;
}

.listing-copy {
  display: flex;
  flex-direction: column;
  gap: 0.04rem;
  width: 6.88rem;
}

.listing-title {
  width: 6.88rem;
  height: 0.4rem;
  font-size: 0.28rem;
  font-weight: 500;
  line-height: 0.392rem;
  color: #000000;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: 0.32rem;
  height: 0.4rem;
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.28rem;
  font-weight: 400;
  line-height: 0.392rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.04rem;
  height: 0.4rem;
  white-space: nowrap;
}

.icon-16 {
  width: 0.32rem;
  height: 0.32rem;
  flex: 0 0 0.32rem;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 6.88rem;
  overflow: hidden;
}

.night-price {
  display: flex;
  align-items: flex-end;
  gap: 0.08rem;
  white-space: nowrap;
}

.night-price span {
  font-size: 0.4rem;
  font-weight: 500;
  line-height: 0.56rem;
  color: #000000;
}

.night-price em {
  font-size: 0.24rem;
  font-weight: 500;
  font-style: normal;
  line-height: 0.44rem;
  color: rgba(0, 0, 0, 0.5);
}

.select-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.44rem;
  height: 0.64rem;
  padding: 0 0.32rem;
  font-size: 0.28rem;
  font-weight: 500;
  line-height: 0.392rem;
  color: #ffffff;
  white-space: nowrap;
  background: #000000;
  border-radius: 0.16rem;
}

.tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 1.56rem;
  background: #ffffff;
  border-top: 1px solid #e6e6e6;
  box-shadow: 0 -0.01rem 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(0.2rem);
}

.tabs {
  position: absolute;
  top: -0.01rem;
  left: 0;
  right: 0;
  height: 0.88rem;
  overflow: hidden;
}

.tab-icon {
  position: absolute;
  top: 0.24rem;
  display: block;
  width: 0.48rem;
  height: 0.48rem;
}

.tab-home {
  left: 0.52rem;
}

.tab-calendar {
  left: 2.02rem;
}

.tab-trips {
  left: 3.52rem;
}

.tab-heart {
  left: 5.02rem;
}

.tab-person {
  left: 6.52rem;
}

.tab-icon.muted {
  opacity: 0.3;
}

.home-indicator {
  position: absolute;
  bottom: 0.16rem;
  left: 2.42rem;
  width: 2.68rem;
  height: 0.1rem;
  background: #000000;
  border-radius: 2rem;
}

@media (min-width: 768px) {
  .booking-page {
    width: 6rem;
    height: 12.99rem;
    border-left: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
  }

  .search-area {
    height: 1.95rem;
  }

  .search-card {
    top: 0.13rem;
    left: 0.26rem;
    gap: 0.19rem;
    width: 5.49rem;
    height: 1.02rem;
    padding: 0.13rem 0.26rem 0.13rem 0.19rem;
    border-radius: 0.19rem;
  }

  .icon-24 {
    width: 0.38rem;
    height: 0.38rem;
    flex-basis: 0.38rem;
  }

  .search-text {
    gap: 0.03rem;
    width: 3.95rem;
    height: 0.77rem;
  }

  .city {
    width: 3.95rem;
    height: 0.38rem;
    font-size: 0.26rem;
    line-height: 0.38rem;
  }

  .conditions {
    gap: 0.1rem;
    height: 0.35rem;
    font-size: 0.22rem;
    line-height: 0.35rem;
  }

  .filter-row {
    top: 1.28rem;
    left: 0.26rem;
    gap: 0.13rem;
    height: 0.54rem;
  }

  .filter-button {
    gap: 0.06rem;
    height: 0.54rem;
    padding: 0.1rem 0.13rem 0.1rem 0.16rem;
    font-size: 0.22rem;
    line-height: 0.35rem;
    border-radius: 0.1rem;
  }

  .filter-select {
    max-width: 0.96rem;
    height: 0.35rem;
  }

  .language-button {
    width: 1.02rem;
    padding-right: 0.1rem;
  }

  .language-select {
    max-width: 0.58rem;
  }

  .chevron {
    width: 0.29rem;
    height: 0.29rem;
  }

  .results-count {
    top: 1.38rem;
    right: 0.26rem;
    width: 1.06rem;
    height: 0.35rem;
    font-size: 0.22rem;
    line-height: 0.35rem;
  }

  .map-area {
    top: 1.95rem;
    height: 4.35rem;
  }

  .map-image {
    left: -0.53rem;
    width: 7.07rem;
    height: 7.07rem;
  }

  .listing-panel {
    top: 5.92rem;
    height: 5.12rem;
    border-radius: 0.38rem 0.38rem 0 0;
  }

  .handle {
    top: 0.19rem;
    left: 2.62rem;
    width: 0.77rem;
    height: 0.06rem;
  }

  .listing-stack,
  .listing-card,
  .listing-info,
  .listing-copy,
  .listing-title,
  .price-row {
    width: 5.5rem;
  }

  .listing-stack {
    top: 0.38rem;
    left: 0.25rem;
    gap: 0.51rem;
  }

  .listing-card {
    height: 3.74rem;
    flex-basis: 3.74rem;
  }

  .image-carousel,
  .listing-image {
    width: 5.5rem;
    height: 2.4rem;
  }

  .pagination {
    bottom: 0.13rem;
    left: 2.39rem;
    width: 0.72rem;
    height: 0.08rem;
  }

  .listing-info {
    top: 2.59rem;
    gap: 0.13rem;
  }

  .listing-title,
  .meta-row,
  .meta-item {
    height: 0.32rem;
  }

  .listing-title,
  .meta-row {
    font-size: 0.22rem;
    line-height: 0.31rem;
  }

  .icon-16 {
    width: 0.26rem;
    height: 0.26rem;
    flex-basis: 0.26rem;
  }

  .night-price span {
    font-size: 0.32rem;
    line-height: 0.45rem;
  }

  .night-price em {
    font-size: 0.19rem;
    line-height: 0.35rem;
  }

  .select-button {
    width: 1.15rem;
    height: 0.51rem;
    padding: 0 0.26rem;
    font-size: 0.22rem;
    line-height: 0.31rem;
    border-radius: 0.13rem;
  }

  .tab-bar {
    height: 1.25rem;
  }

  .tabs {
    height: 0.7rem;
  }

  .tab-icon {
    top: 0.19rem;
    width: 0.38rem;
    height: 0.38rem;
  }

  .tab-home {
    left: 0.42rem;
  }

  .tab-calendar {
    left: 1.62rem;
  }

  .tab-trips {
    left: 2.82rem;
  }

  .tab-heart {
    left: 4.02rem;
  }

  .tab-person {
    left: 5.22rem;
  }

  .home-indicator {
    bottom: 0.13rem;
    left: 1.94rem;
    width: 2.14rem;
    height: 0.08rem;
  }
}

@media (min-width: 1200px) {
  .booking-page {
    width: 4.6rem;
    height: 9.96rem;
    margin-top: 0.32rem;
    box-shadow: 0 0.08rem 0.28rem rgba(0, 0, 0, 0.08);
  }

  .search-area {
    height: 1.5rem;
  }

  .search-card {
    top: 0.1rem;
    left: 0.2rem;
    gap: 0.15rem;
    width: 4.2rem;
    height: 0.79rem;
    padding: 0.1rem 0.2rem 0.1rem 0.15rem;
    border-radius: 0.15rem;
  }

  .icon-24 {
    width: 0.3rem;
    height: 0.3rem;
    flex-basis: 0.3rem;
  }

  .search-text {
    width: 3.03rem;
    height: 0.59rem;
  }

  .city {
    width: 3.03rem;
    height: 0.3rem;
    font-size: 0.2rem;
    line-height: 0.3rem;
  }

  .conditions {
    gap: 0.08rem;
    height: 0.27rem;
    font-size: 0.17rem;
    line-height: 0.27rem;
  }

  .filter-row {
    top: 0.98rem;
    left: 0.2rem;
    gap: 0.1rem;
    height: 0.42rem;
  }

  .filter-button {
    height: 0.42rem;
    padding: 0.07rem 0.1rem 0.07rem 0.12rem;
    font-size: 0.17rem;
    line-height: 0.27rem;
    border-radius: 0.08rem;
  }

  .filter-select {
    max-width: 0.74rem;
    height: 0.27rem;
  }

  .language-button {
    width: 0.78rem;
    padding-right: 0.08rem;
  }

  .language-select {
    max-width: 0.45rem;
  }

  .chevron {
    width: 0.22rem;
    height: 0.22rem;
  }

  .results-count {
    top: 1.06rem;
    right: 0.2rem;
    width: 0.81rem;
    height: 0.27rem;
    font-size: 0.17rem;
    line-height: 0.27rem;
  }

  .map-area {
    top: 1.5rem;
    height: 3.34rem;
  }

  .map-image {
    left: -0.4rem;
    width: 5.42rem;
    height: 5.42rem;
  }

  .listing-panel {
    top: 4.54rem;
    height: 3.93rem;
    border-radius: 0.3rem 0.3rem 0 0;
  }

  .handle {
    top: 0.15rem;
    left: 2.01rem;
    width: 0.59rem;
    height: 0.05rem;
  }

  .listing-stack,
  .listing-card,
  .listing-info,
  .listing-copy,
  .listing-title,
  .price-row {
    width: 4.22rem;
  }

  .listing-stack {
    top: 0.3rem;
    left: 0.19rem;
    gap: 0.39rem;
  }

  .listing-card {
    height: 2.87rem;
    flex-basis: 2.87rem;
  }

  .image-carousel,
  .listing-image {
    width: 4.22rem;
    height: 1.84rem;
  }

  .listing-info {
    top: 1.99rem;
    gap: 0.1rem;
  }

  .listing-title,
  .meta-row {
    font-size: 0.17rem;
    line-height: 0.24rem;
  }

  .listing-title,
  .meta-row,
  .meta-item {
    height: 0.25rem;
  }

  .icon-16 {
    width: 0.2rem;
    height: 0.2rem;
    flex-basis: 0.2rem;
  }

  .night-price span {
    font-size: 0.25rem;
    line-height: 0.35rem;
  }

  .select-button {
    width: 0.88rem;
    height: 0.39rem;
    font-size: 0.17rem;
    border-radius: 0.1rem;
  }

  .tab-bar {
    height: 0.96rem;
  }

  .tab-icon {
    top: 0.15rem;
    width: 0.3rem;
    height: 0.3rem;
  }

  .tab-home {
    left: 0.32rem;
  }

  .tab-calendar {
    left: 1.24rem;
  }

  .tab-trips {
    left: 2.16rem;
  }

  .tab-heart {
    left: 3.08rem;
  }

  .tab-person {
    left: 4rem;
  }

  .home-indicator {
    left: 1.49rem;
    width: 1.64rem;
  }
}
</style>
