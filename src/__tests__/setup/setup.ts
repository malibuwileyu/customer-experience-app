/**
 * @fileoverview Global test setup configuration
 * @module test/setup
 * @description
 * Configures global test setup and teardown using Vitest and React Testing Library.
 * Ensures proper cleanup after each test to prevent test pollution.
 */

import '@testing-library/jest-dom'
import { expect, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanupTestUsers } from './test-users'

expect.extend(matchers)

// Add Testing Library matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeDefined(): void;
    toBeDisabled(): void;
    toHaveValue(value: string): void;
    toBeVisible(): void;
    toHaveTextContent(text: string | RegExp): void;
    toHaveAttribute(attr: string, value?: string): void;
  }
}

// Mock scrollIntoView for Radix UI
Element.prototype.scrollIntoView = vi.fn()

// Mock hasPointerCapture for Radix UI
Element.prototype.hasPointerCapture = vi.fn()
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Clean up test users after all tests
afterAll(async () => {
  try {
    await cleanupTestUsers()
  } catch (error) {
    console.warn('Failed to clean up test users:', error)
  }
})

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock pointer capture
const pointerCaptureMock = {
  hasPointerCapture: vi.fn(),
  setPointerCapture: vi.fn(),
  releasePointerCapture: vi.fn(),
}

// Mock MessageEvent
class MessageEventMock extends Event {
  data: any = null;
  origin: string = '';
  lastEventId: string = '';
  source: MessageEventSource | null = null;
  ports: ReadonlyArray<MessagePort> = [];

  constructor(type: string, init?: MessageEventInit) {
    super(type, { ...init, bubbles: init?.bubbles ?? false, cancelable: init?.cancelable ?? false })
    
    // Get property descriptors from Event.prototype
    const eventProto = Object.getPrototypeOf(new Event(type))
    const propertyDescriptors = Object.getOwnPropertyDescriptors(eventProto)

    // Define properties with proper descriptors
    Object.defineProperties(this, {
      ...propertyDescriptors,
      data: { value: init?.data ?? null, configurable: true },
      origin: { value: init?.origin ?? '', configurable: true },
      lastEventId: { value: init?.lastEventId ?? '', configurable: true },
      source: { value: init?.source ?? null, configurable: true },
      ports: { value: init?.ports ?? [], configurable: true }
    })

    // Ensure instanceof checks work correctly
    Object.setPrototypeOf(this, MessageEventMock.prototype)
  }
}

// Mock MessageEvent globally
Object.defineProperty(window, 'MessageEvent', {
  value: MessageEventMock,
  writable: true,
  configurable: true
});

// Mock BroadcastChannel
class BroadcastChannelMock extends EventTarget {
  private name: string;
  private static channels: Map<string, BroadcastChannelMock[]> = new Map();

  constructor(name: string) {
    super();
    this.name = name;
    const channels = BroadcastChannelMock.channels.get(name) || [];
    channels.push(this);
    BroadcastChannelMock.channels.set(name, channels);
  }

  postMessage(message: any) {
    const channels = BroadcastChannelMock.channels.get(this.name) || [];
    const messageEvent = new MessageEventMock('message', {
      data: message,
      origin: window.location.origin,
      lastEventId: '',
      source: null,
      ports: []
    });
    channels.forEach(channel => {
      if (channel !== this) {
        channel.dispatchEvent(messageEvent);
      }
    });
  }

  close() {
    const channels = BroadcastChannelMock.channels.get(this.name) || [];
    const index = channels.indexOf(this);
    if (index > -1) {
      channels.splice(index, 1);
    }
    if (channels.length === 0) {
      BroadcastChannelMock.channels.delete(this.name);
    }
  }
}

// Mock BroadcastChannel globally
global.BroadcastChannel = BroadcastChannelMock as any;

// Mock user-event specific events
Object.defineProperty(window, 'PointerEvent', {
  value: class PointerEvent extends Event {
    constructor(type: string, init?: PointerEventInit) {
      super(type, init)
      // Get property descriptors from Event.prototype
      const eventProto = Object.getPrototypeOf(new Event(type))
      const propertyDescriptors = Object.getOwnPropertyDescriptors(eventProto)

      // Define properties with proper descriptors
      Object.defineProperties(this, {
        ...propertyDescriptors,
        clientX: { value: init?.clientX ?? 0, configurable: true },
        clientY: { value: init?.clientY ?? 0, configurable: true },
        pointerId: { value: init?.pointerId ?? 1, configurable: true },
        pressure: { value: init?.pressure ?? 0, configurable: true },
        pointerType: { value: init?.pointerType ?? 'mouse', configurable: true }
      })
    }
  }
})

Object.defineProperty(window, 'MouseEvent', {
  value: class MouseEvent extends Event {
    constructor(type: string, init?: MouseEventInit) {
      super(type, init)
      // Get property descriptors from Event.prototype
      const eventProto = Object.getPrototypeOf(new Event(type))
      const propertyDescriptors = Object.getOwnPropertyDescriptors(eventProto)

      // Define properties with proper descriptors
      Object.defineProperties(this, {
        ...propertyDescriptors,
        clientX: { value: init?.clientX ?? 0, configurable: true },
        clientY: { value: init?.clientY ?? 0, configurable: true },
        button: { value: init?.button ?? 0, configurable: true },
        buttons: { value: init?.buttons ?? 0, configurable: true }
      })
    }
  }
})

Object.defineProperty(window, 'KeyboardEvent', {
  value: class KeyboardEvent extends Event {
    constructor(type: string, init?: KeyboardEventInit) {
      super(type, init)
      // Get property descriptors from Event.prototype
      const eventProto = Object.getPrototypeOf(new Event(type))
      const propertyDescriptors = Object.getOwnPropertyDescriptors(eventProto)

      // Define properties with proper descriptors
      Object.defineProperties(this, {
        ...propertyDescriptors,
        key: { value: init?.key ?? '', configurable: true },
        code: { value: init?.code ?? '', configurable: true },
        location: { value: init?.location ?? 0, configurable: true },
        repeat: { value: init?.repeat ?? false, configurable: true },
        isComposing: { value: init?.isComposing ?? false, configurable: true }
      })
    }
  }
})

// Add mocks to global
vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.stubGlobal('MessageEvent', MessageEventMock)

Object.defineProperties(window.HTMLElement.prototype, {
  hasPointerCapture: { value: pointerCaptureMock.hasPointerCapture },
  setPointerCapture: { value: pointerCaptureMock.setPointerCapture },
  releasePointerCapture: { value: pointerCaptureMock.releasePointerCapture },
}) 