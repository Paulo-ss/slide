export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.distancia = { finalPosition: 0, startX: 0, movement: 0 }
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  moveSlide(distanciaX) {
    this.distancia.movePosition = distanciaX;
    this.slide.style.transform = `translate3d(${distanciaX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.distancia.movement = (this.distancia.startX - clientX) * 1.6;
    return this.distancia.finalPosition - this.distancia.movement;
  }

  onMove(e) {
    const finalPosition = this.updatePosition(e.clientX);
    this.moveSlide(finalPosition);
  }

  onStart(e) {
    e.preventDefault();
    this.distancia.startX = e.clientX;
    this.wrapper.addEventListener('mousemove', this.onMove);
  }

  onEnd() {
    this.wrapper.removeEventListener('mousemove', this.onMove);
    this.distancia.finalPosition = this.distancia.movePosition;
  }

  addSlideEvent() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
  }

  init() {
    this.bindEvents();
    this.addSlideEvent();
    return this;
  }
}