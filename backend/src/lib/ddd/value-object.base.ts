import { ArgumentNotProvidedException } from '../exceptions';
import { Guard } from '../guards';
import { convertPropsToObject } from '../utils/convert-props-to-object.util';

export type Primitive = string | number | boolean;
export interface DomainPrimitive<T extends Primitive | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitive | Date ? DomainPrimitive<T> : T;

export abstract class ValueObject<T> {
  constructor(props: ValueObjectProps<T>) {
    this.checkIfEmpty(props);
    this.validate(props);
    this.props = props;
  }

  protected readonly props: ValueObjectProps<T>;

  protected abstract validate(props: ValueObjectProps<T>): void;

  private checkIfEmpty(props: ValueObjectProps<T>): void {
    if (
      Guard.isEmpty(props) ||
      (this.isDomainPrimitive(props) && Guard.isEmpty(props.value))
    ) {
      throw new ArgumentNotProvidedException(
        'Value object props must be provided',
      );
    }
  }

  private isDomainPrimitive(
    obj: unknown,
  ): obj is DomainPrimitive<T & (Primitive | Date)> {
    if (Object.prototype.hasOwnProperty.call(obj, 'value')) {
      return true;
    }
    return false;
  }

  public unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }
    const propsCopy = convertPropsToObject(this.props);

    return Object.freeze(propsCopy) as T;
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  static isValueObject(obj: unknown): obj is ValueObject<unknown> {
    return obj instanceof ValueObject;
  }
}
