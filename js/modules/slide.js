export default class Slide {
  constructor(slide, wrapper) {
    // Selecionando os elementos slide
    this.slide = document.querySelector(slide);
    // Selecionando o wrapper do slide
    this.wrapper = document.querySelector(wrapper);
    // Objeto com a posição do mouse do do touch inicial,
    // final e o movimento total percorrido
    this.distancia = { finalPosition: 0, startX: 0, movement: 0 }
  }

  // Método que faz o this de todos os métodos de callback
  // fazerem ferência a classe
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  // Método que move os itens dos slides usando a propriedade 
  // CSS transform: translate3d baseado no movimento percorrido
  moveSlide(distanciaX) {
    this.distancia.movePosition = distanciaX;
    this.slide.style.transform = `translate3d(${distanciaX}px, 0, 0)`;
  }

  // Método que atualiza a posição final do mouse/touch
  updatePosition(clientX) {
    this.distancia.movement = (this.distancia.startX - clientX) * 1.6;
    return this.distancia.finalPosition - this.distancia.movement;
  }

  // Método executado durante o mousemove/touchmove que ativa o
  // método para dar update na posição final do pointer e usar esse
  // valor para mover o slide usando o método moveSlide()
  onMove(e) {
    const pointerPosition = (e.type === 'mousemove') ? e.clientX : e.changedTouches[0].clientX;

    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  // Método que ocorre ao mousedown/touchstart que pega
  // a posição inicial do clique e adiciona ou o evento
  // de mousemove ou o de touchmove
  onStart(e) {
    let movetype;

    // Verificando se o evento é com mouse ou com touch
    if (e.type === 'mousedown') {
      e.preventDefault();
      this.distancia.startX = e.clientX;
      movetype = 'mousemove';
    } else {
      this.distancia.startX = e.changedTouches[0].clientX;
      movetype = 'touchmove';
    }

    this.wrapper.addEventListener(movetype, this.onMove);
  }

  // Método que ocorre quando o clique acabar, removendo os
  // eventListeners do wrapper do slide e atualizando a posição
  // final no objeto distância para ser usado como referência na
  // próxima execução
  onEnd(e) {
    const movetype = (e.type === 'mouseup') ? 'mousemove' : 'touchmove';

    this.wrapper.removeEventListener(movetype, this.onMove);
    this.distancia.finalPosition = this.distancia.movePosition;
  }

  // Método que adiciona os eventListeners ao wrapper do slide
  addSlideEvent() {
    // Eventos iniciais do mouse e touch
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);

    //Eventos finais do mouse e touch
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  // Slides config

  slidePositionCenter(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;

    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePositionCenter(element);

      return { position, element };
    });
  }

  // Método que pega os index de todos os itens da array do slide
  // Pega o item ativo, anterior e o próximo
  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;

    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];

    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);

    this.distancia.finalPosition = activeSlide.position;
  }

  // Método que inicia a classe
  init() {
    this.bindEvents();
    this.addSlideEvent();
    return this;
  }
}