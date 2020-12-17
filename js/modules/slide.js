// Importando a função de debounce
import debounce from './debounce.js';

export class Slide {
  constructor(slide, wrapper) {
    // Selecionando os elementos slide
    this.slide = document.querySelector(slide);
    // Selecionando o wrapper do slide
    this.wrapper = document.querySelector(wrapper);
    // Objeto com a posição do mouse do do touch inicial,
    // final e o movimento total percorrido
    this.distancia = { finalPosition: 0, startX: 0, movement: 0 }
    // Classe CSS ativo
    this.activeClass = 'ativo';
    // Criando um novo evento
    this.changeEvent = new Event('changeEvent');
  }

  // Adicionando transição ao elemento slide e aos
  // elementos dentro dele
  transition(active) {
    this.slide.style.transition = active ? 'transform .3s' : '';
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
    this.transition(false);
  }

  // Método que ocorre quando o clique acabar, removendo os
  // eventListeners do wrapper do slide e atualizando a posição
  // final no objeto distância para ser usado como referência na
  // próxima execução
  onEnd(e) {
    const movetype = (e.type === 'mouseup') ? 'mousemove' : 'touchmove';

    this.wrapper.removeEventListener(movetype, this.onMove);
    this.distancia.finalPosition = this.distancia.movePosition;

    this.transition(true);
    this.changeSlideOnEnd();
  }

  // Evento que centraliza o slide anterior ou próximo quando o
  // usuário largar o clique (mouse ou touch)
  changeSlideOnEnd() {
    if ((this.distancia.movement > 120) && (this.index.next !== undefined)) {
      this.goToNextSlide();
    } else if ((this.distancia.movement < -120) && (this.index.prev !== undefined)) {
      this.goToPrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
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

  // Método que retorna a posição de cada slide
  // centralizado na tela
  slidePositionCenter(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;

    return -(slide.offsetLeft - margin);
  }

  // Método que retorna uma array de objetos com a posição
  // de cada slide centralizado na tela e ele mesmo (element)
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePositionCenter(element);

      return { position, element };
    });
  }

  // Método que pega os index de todos os itens da array do slide
  // Pega o slide ativo, anterior e o próximo
  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;

    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  // Método que baseado no index do slide, move para ele
  // o deixando centralizado na tela e salva sua posição final
  changeSlide(index) {
    const activeSlide = this.slideArray[index];

    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);

    this.distancia.finalPosition = activeSlide.position;
    this.changeClassActiveSlide();

    // Método dispatchEvent() que ativa os eventos criados
    // Como está dentro do changeSlide(), será ativado toda vez
    // que um slide mudar
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  // Aplicando a classe CSS de ativo no slide ativo
  changeClassActiveSlide() {
    // Removendo a classe ativo de todos os slides antes de colocar
    this.slideArray.forEach((i) => {
      i.element.classList.remove(this.activeClass);
    });

    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  // Métodos para navegar pelos slides

  // Método para ir pro slide anterior
  goToPrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  // Método para ir pro próximo slide
  goToNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  // Método que atualiza as configurações de posição
  // de cada slide quando a página sofrer um resize
  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize);
  }
  
  // Método que faz o this de todos os métodos de callback
  // fazerem ferência a classe
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.goToPrevSlide = this.goToPrevSlide.bind(this);
    this.goToNextSlide = this.goToNextSlide.bind(this);
  }

  // Método que inicia a classe
  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvent();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

// Criando a subclasse SlideNav para fazer a funcionalidade
// de navegação a partir dos botões de anterior e próximo
export class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper);
    this.bindControlEvents();
  }
  // Método que seleciona os elementos do DOM para
  // navegar para frente e para trás no slide
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);

    this.addArrowEvent();
  }

  // Método para adicionar os eventListeners de 
  // click nos botões de navegação 
  addArrowEvent() {
    this.prevElement.addEventListener('click', this.goToPrevSlide);
    this.nextElement.addEventListener('click', this.goToNextSlide);
  }

  // Método que cria os controles de navegação
  // Uma ul com uma li para cada slide dentro
  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';
    
    this.slideArray.forEach((i, index) => {
      control.innerHTML += `<li><a href="${ index + 1 }"> ${ index + 1 } </a></li>`;
    });

    this.wrapper.appendChild(control);
    return control;
  }

  // Método que adiciona o evento click aos controles
  // de navegação que ativa o método changeSlide()
  eventControl(item, index) {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      this.changeSlide(index);
    });

    // Chamando o evento criado changeEvent
    this.wrapper.addEventListener('changeEvent', this.ativoControlItem);
  }

  // Método que cria uma array com cada item de controle
  // de navegação
  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];

    this.ativoControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  // Método que adiciona a classe ativo ao controle
  // que corresponde ao slide ativo atual
  ativoControlItem() {
    this.controlArray.forEach((i) => {
      i.classList.remove(this.activeClass);
    });

    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  // Método que da o bind nos métodos de callback para a classe
  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.ativoControlItem = this.ativoControlItem.bind(this);
  }
}