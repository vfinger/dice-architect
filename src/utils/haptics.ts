import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function hapticLight() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
}

export async function hapticMedium() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }
}

export async function hapticHeavy() {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 30, 35]);
    }
  }
}

export async function hapticSuccess() {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 40, 25]);
    }
  }
}
