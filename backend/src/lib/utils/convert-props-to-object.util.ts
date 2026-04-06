import { Entity } from '../ddd/entity.base';
import { ValueObject } from '../ddd/value-object.base';

function convertToPlainObject(item: unknown): unknown {
  if (ValueObject.isValueObject(item)) {
    return item.unpack();
  }
  if (Entity.isEntity(item)) {
    return item.toObject();
  }
  return item;
}

export function convertPropsToObject<T>(props: T): T {
  const propsCopy = structuredClone(props) as Record<string, unknown>;

  for (const prop in propsCopy) {
    const value = propsCopy[prop];

    if (Array.isArray(value)) {
      propsCopy[prop] = value.map((item) => {
        return convertToPlainObject(item);
      });
      continue;
    }

    propsCopy[prop] = convertToPlainObject(value);
  }

  return propsCopy as T;
}
