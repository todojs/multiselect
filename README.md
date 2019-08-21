# TODOJS-MULTISELECT

This is a multiple selection control, similar to HTML SELECT control, but includes more
features, such as the possibility of filtering content, selecting or deselecting all elements,
etc.

The component is registered directly from the todojs-multiselect.js module that can be loaded
with
```js
import '.todojs-multiselect.js';
```
or
```html
<script src="todojs-multiselect.js"></script>
```
The simplest example of using the component is:
```html
<todojs-multiselect>
  <option value="1">uno</option>
  <option value="2">dos</option>
  <option value="3">tres</option>
  <option value="4">cuatro</option>
</todojs-multiselect>
```

## Attributes

### `OPEN`

When the OPEN attribute is present, the component is displayed open. This attribute appears when
the component is opened by the user or when it is opened by the .open () method.

### `DISABLED`
When the disabled attribute is present, the component is shown with a gray background and cannot
be edited or opened. This attribute is associated with .disabled property.

### `TABINDEX`
Although not explicitly specified, the component sets a TABINDEX="0" for itself. It is possible
for the component user to specify any other value for the tabindex attribute and the
component will respect it.

## Light DOM

To indicate the values​that should be displayed in the component, HTML elements of type OPTION
are included inside, similar to a SELECT element. This list of items is associated with the
.options property.

## Properties

### `.disabled`
Using the .disabled property you can query and update the DISABLED attribute. If is true, the
component is shown with a gray background and it isn't possible to edit or open it.

### `.options`
Through the .options property we have access (read and write) to the array OPTION elements. Each
of the elements is defined with an object with these properties:
```json
 {"id": "tj96iup275", "value": "1", "text": "one", "selected": false}
```
Through the .options property we can modify, add or delete the options. We will operate with the
array that returns this property, or assign a new array. Any changes to the options thrown an
update event. If only the selected property is modified, then the change event is thrown.

### `.value`
Through the .value property we have access (read and write) to the array of values​that have
been selected. Changes to the property thronw a change event.

## Methods

### `.open()`
Show the component open and, as a consequence, add the attribute open to the component.

### `.close()`
If the component is open, this method close it, as a consequence, remove the open attribute.

## Events

### `update`
The update event is thrown when the .option property is changed, that is, when any options is
added or removed.

### `change`
The change event is throw when the .value property is changed, that is, when any options is
selected or deselected.

### `open`
The open event is launched when the component is displayed as open and the options that can be
selected.

### `close`
The close event is launched when the component is closed and display a list of sectioned values.

./