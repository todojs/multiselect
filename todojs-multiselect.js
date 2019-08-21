/**
 *
 *  TODOJS-MULTISELECT
 *
 *  This is a multiple selection control, similar to HTML SELECT control, but includes more
 *  features, such as the possibility of filtering content, selecting or deselecting all elements,
 *  etc.
 *
 *  The component is registered directly from the todojs-multiselect.js module that can be loaded
 *  with
 *    import './components/todojs-multiselect.js';
 *  or
 *    <script src="components/todojs-multiselect.js"></script>
 *
 *  The simplest example of using the component is:
 *    <todojs-multiselect>
 *      <option value="1">uno</option>
 *      <option value="2">dos</option>
 *      <option value="3">tres</option>
 *      <option value="4">cuatro</option>
 *    </todojs-multiselect>
 *
 *  - Attributes -
 *
 *  OPEN
 *  When the OPEN attribute is present, the component is displayed open. This attribute appears when
 *  the component is opened by the user or when it is opened by the .open () method.
 *
 *  DISABLED
 *  When the disabled attribute is present, the component is shown with a gray background and cannot
 *  be edited or opened. This attribute is associated with .disabled property.
 *
 *  TABINDEX
 *  Although not explicitly specified, the component sets a TABINDEX="0" for itself. It is possible
 *  for the component user to specify any other value for the tabindex attribute and the
 *  component will respect it.
 *
 *  - Light DOM -
 *
 *  To indicate the values​that should be displayed in the component, HTML elements of type OPTION
 *  are included inside, similar to a SELECT element. This list of items is associated with the
 *  .options property.
 *
 *  - Properties -
 *
 *  .disabled
 *  Using the .disabled property you can query and update the DISABLED attribute. If is true, the
 *  component is shown with a gray background and it isn't possible to edit or open it.
 *
 *  .options
 *  Through the .options property we have access (read and write) to the array OPTION elements. Each
 *  of the elements is defined with an object with these properties:
 *     {"id": "tj96iup275", "value": "1", "text": "one", "selected": false}
 *  Through the .options property we can modify, add or delete the options. We will operate with the
 *  array that returns this property, or assign a new array. Any changes to the options thrown an
 *  update event. If only the selected property is modified, then the change event is thrown.
 *
 *  .value
 *  Through the .value property we have access (read and write) to the array of values​that have
 *  been selected. Changes to the property thronw a change event.
 *
 *  - Methods -
 *
 *  .open()
 *  Show the component open and, as a consequence, add the attribute open to the component.
 *
 *  .close()
 *  If the component is open, this method close it, as a consequence, remove the open attribute.
 *
 *  - Events -
 *
 *  update
 *  The update event is thrown when the .option property is changed, that is, when any options is
 *  added or removed.
 *
 *  change
 *  The change event is throw when the .value property is changed, that is, when any options is
 *  selected or deselected.
 *
 *  open
 *  The open event is launched when the component is displayed as open and the options that can be
 *  selected.
 *
 *  close
 *  The close event is launched when the component is closed and display a list of sectioned values.
 *
 **/
{
  
  // Global function: generate a simple unique id
  const uuid = () => 't' + Math.random ().toString (32).substr (2);
  
    // private symbols
  const RENDER_INITIAL           = Symbol ();
  const RENDER_REFRESH           = Symbol ();
  const RENDER_REFRESH_SELECTALL = Symbol ();
  const RECURSIVE_REFRESH        = Symbol ();
  
  //---------------------------------------------------------------------------
  // Class TMultiselect
  //---------------------------------------------------------------------------
  class TodojsMultiselect extends HTMLElement {
    
    //-----------------------
    // component constructor
    
    constructor () {
      super ();
      
      // private property for avoid circular update
      this[ RECURSIVE_REFRESH ] = false;
      
      // Create Shadow DOMs
      this.attachShadow ({mode : 'open'});
      
      // Observe Light DOM changes
      new MutationObserver (
        (mutations) => {
          let refresh = false;
          let update  = false;
          let change  = false;
          for (let mutation of mutations) {
            if (mutation.attributeName !== 'class') {
              refresh = true;
            }
            if (mutation.attributeName === 'selected') {
              change = true;
            }
            if (mutation.type === 'childList') {
              update = true;
            }
          }
          if (refresh) {
            this[ RENDER_REFRESH ] ();
          }
          if (update) {
            this.dispatchEvent (new Event ("update"));
          }
          if (change) {
            this.dispatchEvent (new Event ("change"));
          }
        }
      ).observe (
        this,
        {
          subtree         : true,
          attributes      : true,
          attributeFilter : [ 'selected' ],
          childList       : true,
          characterData   : true
        }
      );
      
      this[ RENDER_INITIAL ] ();
      
    }
    
    //-------------------------------
    // component observed attributes
    static get observedAttributes () {
      return [ 'open', 'disabled' ];
    }
    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'disabled') {
        if (newValue === '') {
          this.removeAttribute('open');
          this.setAttribute('last-tabindex', this.getAttribute('tabindex'));
          this.removeAttribute('tabindex');
        } else {
          this.setAttribute('tabindex', this.getAttribute('last-tabindex') || '0');
        }
      } else if (name === 'open') {
        if (newValue === '') {
          if (this.hasAttribute ('disabled')) {
            this.removeAttribute ('open');
          } else {
          this.shadowRoot.querySelectorAll ('#checkboxes p.hidden').forEach (p => {
            p.classList.remove ('hidden');
          });
          const search =  this.shadowRoot.querySelector ('#search');
          search.value = '';
          search.focus ();
          this.dispatchEvent (new Event ("open"));
          }
        } else {
          this.dispatchEvent (new Event ("close"));
        }
      }
    }
    
    //--------------------
    // connected callback
    
    connectedCallback () {
      // Allow focus
      if (!this.hasAttribute('disabled') &&
          !this.hasAttribute('tabindex') )
      {
        this.setAttribute ('tabindex', '0');
      }
    }
    
    //-------------------
    // disabled property
    
    get disabled () {
      return this.hasAttribute ('disabled');
    }
    set disabled (newValue) {
      if (newValue) {
        this.setAttribute ('disabled', 'true')
      } else {
        this.removeAttribute ('disabled')
      }
    }
    
    //------------------
    // options property
    
    get options () {
      const that = this;
      return new Proxy ([], {
        get (target, property) {
          if (property === 'length') {
            return that.querySelectorAll ('option').length;
          }
          if (property === Symbol.iterator) {
            const result = [ ...that.querySelectorAll ('option') ]
              .map (getOption);
            return result[ Symbol.iterator ];
          }
          if (typeof property === 'string' && isNaN (parseInt (property))) {
            return Reflect.get (target, property);
          }
          return getOption (that.querySelectorAll ('option')[property]);
        },
        set (target, property, value) {
          if (property === 'length') {
            return true;
          }
          const options = that.querySelectorAll ('option');
          let option    = options[property];
          let newOption = false;
          if (!option) {
            option    = document.createElement ('option');
            newOption = true;
          }
          option.id = value.id || uuid ();
          value.value ? option.value = value.value : undefined;
          option.innerText = value.text || '';
          if (value.selected) {
            option.setAttribute ('selected', 'true');
          } else {
            option.removeAttribute ('selected');
          }
          if (newOption) {
            that.appendChild (option);
          }
          return true;
        },
        has (target, property) {
          if (typeof property === 'symbol' ||
              (typeof property === 'string' &&
               isNaN (parseInt (property))
              )
          )
          {
            return Reflect.has (target, property);
          }
          const options = that.querySelectorAll ('option');
          return !!options[property];
        },
        deleteProperty (target, property) {
          const options = that.querySelectorAll ('option');
          const option  = options[property];
          const element = getOption (option);
          option.parentElement.removeChild (option);
          return element;
        }
      });
      // local function that return a single option observed object
      function getOption (el) {
        return {
          get id () {
            return el.id
          },
          set id (newId) {
            return el.id = newId;
          },
          get value () {
            return el.value
          },
          set value (newValue) {
            return el.value = newValue
          },
          get text () {
            return el.innerText || undefined;
          },
          set text (newText) {
            return el.innerText = newText;
          },
          get selected () {
            return el.hasAttribute ('selected');
          },
          set selected (newSelection) {
            if (newSelection) {
              el.setAttribute ('selected', 'true');
            } else {
              el.removeAttribute ('selected');
            }
          }
        };
      }
    }
    set options (values) {
      let child      = this.lastElementChild;
      while (child) {
        this.removeChild (child);
        child = this.lastElementChild;
      }
      values.forEach ((value) => this.options.push (value));
    }
    
    //----------------
    // value property
    
    get value () {
      const that = this;
      return new Proxy ([], {
        get (target, property) {
          if (property === 'length') {
            return that.querySelectorAll ('option[selected]').length;
          }
          if (property === Symbol.iterator) {
            const result = [ ...that.querySelectorAll ('option[selected]') ]
              .map (e => e.value);
            return result[ Symbol.iterator ];
          }
          if (typeof property === 'string' && isNaN (parseInt (property))) {
            return Reflect.get (target, property);
          }
          return that.querySelectorAll ('option[selected]')[property].value;
        },
        set (target, property, value) {
          if (property === 'length') {
            return true;
          }
          that.querySelector (`option[value="${ value }"]`).setAttribute ('selected', 'true');
          return true;
        },
        has (target, property) {
          if (typeof property === 'symbol' ||
              (typeof property === 'string' &&
               isNaN (parseInt (property))
              )
          )
          {
            return Reflect.has (target, property);
          }
          return !!that.querySelectorAll ('option[selected]')[property];
        },
        deleteProperty (target, property) {
          if (typeof property === 'symbol' ||
              (typeof property === 'string' &&
               isNaN (parseInt (property))
              )
          )
          {
            return Reflect.deleteProperty (target, property);
          }
          that.querySelectorAll ('option[selected]')[property].removeAttribute ('selected');
          return true;
        }
      });
    }
    set value (values) {
      const options  = this.querySelectorAll ('option');
      for (let n = 0; n < options.length; n++) {
        if (values.indexOf (options[ n ].value) === -1) {
          options[ n ].removeAttribute ('selected');
        } else {
          options[ n ].setAttribute ('selected', 'true');
        }
      }
    }
    
    //-------------
    // open method
    
    open () {
      this.setAttribute ('open', 'true');
    }
    
    //--------------
    // close method
    
    close () {
      this.removeAttribute ('open');
    }
    
    // Helper functions
    
    // create the base shadow DOM content
    [ RENDER_INITIAL ] () {
      
      // Shadow DOM Style
      this.shadowRoot.innerHTML = `
<link rel="stylesheet"
      href="//fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">
<style>
  :host {
    display            : inline-block;
    position           : relative;
    font-family        : Roboto, Arial, sans-serif;
    width              : 24em;
    color              : #000;
    background-color   : #FFF;
  }
  :host([disabled]) #selection #selected {
    background-color   : var(--todojs-disabled-gbcolor, lightgray);
  }
  #selection {
    position           : relative;
    cursor             : pointer;
    min-width          : 14em;
    width              : 100%;
    height             : 2em;
    border             : 1px solid lightgray;
    background-color   : inherit;
  }
  #selection #selected {
    position           : absolute;
    top                : 0;
    left               : 0;
    right              : 0;
    bottom             : 0;
    padding            : 0.4em 30px 0.4em 0.4em;
    white-space        : nowrap;
    overflow           : hidden;
    text-overflow      : ellipsis;
  }
  #selection #selected:after {
    position           : absolute;
    content            : "";
    top                : calc(1em - 3px);
    right              : 10px;
    width              : 0;
    height             : 0;
    border-width       : 6px;
    border-style       : solid;
    border-color       : #000 transparent transparent transparent;
  }
  :host([open]) #selection #selected:after {
    border-color       : transparent transparent #000 transparent;
    top                : calc( 1em - 8px);
  }
  #dropdown {
    display            : none;
    left               : 0;
    right              : 0;
    top                : auto;
    width              : 100%;
    min-width          : 14em;
    max-height         : 14em;
    overflow-x         : hidden;
    overflow-y         : auto;
    position           : absolute;
    background-color   : inherit;
    border             : solid lightgray;
    border-width       : 0 1px 1px 1px;
    z-index            : 20;
  }
  :host([open]) #dropdown {
    display            : block;
  }
  #search {
    position           : absolute;
    height             : 1.6em;
    width              : calc( 100% - 36px - 1em);
    margin-top         : -0.35em;
    border             : 0;
    color              : inherit;
    background-color   : inherit;
    font-family        : inherit;
    font-size          : inherit;
  }
  #search:focus {
    outline            : none;
  }
  #search::-webkit-input-placeholder,
  #search::placeholder {
    color              : inherit;
    opacity            : 0.4;
    font-style         : italic;
  }
  #dropdown .group {
    display            : block;
    position           : relative;
    height             : 1em;
    margin             : 0;
    padding            : 0.5em 2em;
    font-size          : 1em;
    -webkit-user-select: none;
    -moz-user-select   : none;
    -ms-user-select    : none;
    user-select        : none;
   }
  #dropdown .group.hidden {
    display            : none;
  }
  #dropdown .group .option {
    position           : absolute;
    opacity            : 0;
    cursor             : pointer;
    height             : 0;
    width              : 0;
  }
  #dropdown .group .mark {
    cursor             : pointer;
    position           : absolute;
    top                : 0.5em;
    left               : 0.5em;
    height             : 1em;
    width              : 1em;
    background-color   : var(--todojs-mark-bg-color, #eee);
    z-index            : 20;
  }
  #dropdown .group .option:checked ~ .mark {
    background-color   : var(--todojs-mark-checked-bg-color, #2196F3);
  }
  #dropdown .group:hover .option ~ .mark ~ .label {
    background-color   : var(--todojs-label-hover-bg-color, #eee);
  }
  #dropdown .group .option:focus ~ .mark ~ .label {
    background-color   : var(--todojs-label-focus-bg-color, lightgrey);
  }
  #dropdown .group .mark:after {
    content            : "";
    position           : absolute;
    display            : none;
  }
  #dropdown .group .option:checked ~ .mark:after {
    display            : block;
  }
  #dropdown .group .mark:after {
    left               : 0.35em;
    top                : 0.1em;
    width              : 0.2em;
    height             : 0.5em;
    border-style       : solid;
    border-color       : var(--todojs-mark-color, white);
    border-width       : 0 2px 2px 0;
    -webkit-transform  : rotate(45deg);
    -ms-transform      : rotate(45deg);
    transform          : rotate(45deg);
  }
  #dropdown .group .label {
    cursor             : pointer;
    display            : block;
    position           : absolute;
    height             : 1em;
    top                : 0;
    left               : 0;
    right              : 0;
    padding            : 0.5em 2em;
  }
  #dropdown .group.select-all {
    border-bottom      : 1px dotted darkgray;
  }
</style>
<div id="selection">
  <div id="selected"></div>
</div>
<div id="dropdown">
  <p class="group select-all">
    <input type="checkbox" id="selectAll" class="option">
    <label for="selectAll" class="mark"></label>
    <input type="search" id="search" placeholder="escribe aquí para filtrar">
  </p>
  <div id="checkboxes"></div>
</div>`;
      
      const selection  = this.shadowRoot.querySelector ('#selection');
      const dropdown   = this.shadowRoot.querySelector ('#dropdown');
      const search     = this.shadowRoot.querySelector ('#search');
      const checkboxes = this.shadowRoot.querySelector ('#checkboxes');
      const selectAll  = this.shadowRoot.querySelector ('#selectAll');
      
      // close when blur
      this.addEventListener ('blur', () => {
        this.removeAttribute ('open');
      });
      
      // open with enter or arrow down
      this.addEventListener ('keydown', (evt) => {
        if ((evt.key === 'Enter' ||
             evt.key === 'ArrowDown') &&
            !this.hasAttribute ('open'))
        {
          this.setAttribute ('open', 'true');
        } else if (evt.key === 'Escape') {
          this.removeAttribute ('open');
        }
      });
      
      // open with mouse
      selection.addEventListener ('click', () => {
        if (this.hasAttribute ('open')) {
          this.removeAttribute ('open');
        } else {
          this.setAttribute ('open', 'true');
        }
      });
      
      
      // filter
      search.addEventListener ('keyup', (evt) => {
        if (evt.key === 'Enter') {
          selectAll.click ();
          return evt.preventDefault();
        }
        filter ();
      });
      search.addEventListener ('change', filter);
      search.addEventListener ('search', filter);
      const that = this;
      function filter () {
        const paragraphs = checkboxes.querySelectorAll ('p');
        const text       = search.value.toLowerCase ();
        for (let n = 0; n < paragraphs.length; n++) {
          const p = paragraphs[ n ];
          if (p.innerText.toLowerCase ().search (text) === -1) {
            p.classList.add ('hidden');
          } else {
            p.classList.remove ('hidden');
          }
        }
        that[ RENDER_REFRESH_SELECTALL ] ();
      }
      
      // dropdown keys
      dropdown.addEventListener ('keydown', (evt) => {
        if (evt.key === 'ArrowDown') {
          const focus = dropdown.querySelector ('input:focus');
          if (focus) {
            const next = focus.parentElement.nextElementSibling;
            if (next) {
              next.querySelector ('input').focus ();
            } else {
              search.focus ();
            }
          } else {
            dropdown.querySelector ('input:nth-of-type(2)').focus ();
          }
          evt.preventDefault ();
        } else if (evt.key === 'ArrowUp') {
          const focus = dropdown.querySelector ('input:focus');
          if (focus) {
            if (focus === search) {
              checkboxes.querySelector ('p:last-of-type input').focus ();
            } else {
              const previous = focus.parentElement.previousElementSibling;
              if (previous) {
                previous.querySelector ('input').focus ();
              } else {
                search.focus ();
              }
            }
          } else {
            checkboxes.querySelector ('p:last-of-type input').focus ();
          }
          evt.preventDefault ();
        } else if (evt.key === 'Enter' && evt.target.type === "checkbox") {
          evt.target.click();
        }
      });
      
      // Dropdown click
      dropdown.addEventListener ('click', (evt) => {
        if (evt.target.type === 'checkbox') {
          this[ RECURSIVE_REFRESH ] = true;

          if (evt.target.id === 'selectAll') {
            const checked = evt.target.checked;
            checkboxes.querySelectorAll ('p:not(.hidden) input.option').forEach (i => {
              i.checked = checked;
              if (checked) {
                this.querySelector (`#${ i.id }`).setAttribute ('selected', 'true');
              } else {
                this.querySelector (`#${ i.id }`).removeAttribute ('selected');
              }
            });
            evt.cancelBubble = true;
            return;
          }

          if (evt.target.checked) {
            this.querySelector (`#${ evt.target.id }`).setAttribute ('selected', 'true');
          } else {
            this.querySelector (`#${ evt.target.id }`).removeAttribute ('selected');
          }
          evt.cancelBubble = true;  // Cancel bubble event
        }
      });
      
      this[ RENDER_REFRESH ] ();
      
    }
    
    // update list
    [ RENDER_REFRESH ] () {
    
      // Elements
      const selected   = this.shadowRoot.querySelector ('#selected');
      const options    = this.querySelectorAll ('option');
      const checkboxes = this.shadowRoot.querySelector ('#checkboxes');
      
      // Update
      let text        = '';
      for (let n = 0; n < options.length; n++) {
        text += (options[ n ].hasAttribute ('selected') ? options[ n ].innerText + '; ' : '');
      }
      selected.innerText = text;
      
      // Avoid circular update (from shadow DOM to light DOM to shadow DOM)
      if (this[ RECURSIVE_REFRESH ]) {
        
        this[ RECURSIVE_REFRESH ] = false;
        
      } else {
        
        // Remove all elements
        let child = checkboxes.lastElementChild;
        while (child) {
          checkboxes.removeChild (child);
          child = checkboxes.lastElementChild;
        }
        
        // Get LightDOM options
        for (let n = 0; n < options.length; n++) {
          
          // Put an id if it's missing
          if (!options[ n ].id) {
            options[ n ].id = 't' + Math.random ().toString (36).substr (2, 9);
          }
          
          // Create a new checkox
          const paragraphElement = document.createElement ('p');
          paragraphElement.classList.add ('group');
          paragraphElement.innerHTML = `
            <input
              type="checkbox"
              class="option"
              id="${ options[ n ].id }"
              ${ options[ n ].hasAttribute ('selected') ? `checked` : `` }
            >
            <label class="mark" for="${ options[ n ].id }"></label>
            <label class="label" for="${ options[ n ].id }">${ options[ n ].text }</label>
        `;
          checkboxes.appendChild (paragraphElement);
          
        }
      }
      this[ RENDER_REFRESH_SELECTALL ] ();
      
    }
    
    // update select all checkbox
    [ RENDER_REFRESH_SELECTALL ] () {
      // Elements
      const selectAll  = this.shadowRoot.querySelector ('#selectAll');
      const checkboxes = this.shadowRoot.querySelector ('#checkboxes');
      const checked    = checkboxes.querySelectorAll ('p:not(.hidden) input.option:checked').length;
      const visible    = checkboxes.querySelectorAll ('p:not(.hidden) input.option').length;
      // Update
      selectAll.checked = checked === visible && checked !== 0;
    }
    
  }
  
  //---------------------------------------------------------------------------
  // Register the custom element
  //---------------------------------------------------------------------------
  if (!customElements.get ('todojs-multiselect')) {
    customElements.define ('todojs-multiselect', TodojsMultiselect);
  }
}