import { useAppStore } from '../store';

const callScenarios = [
  {
    time: 5,
    text: "Caller: 'Hello Mr. Ram, I am calling from the HDFC bank card division. We noticed a suspicious attempt to charge ₹45,000 on your account.'",
    observation: "Unverified caller identity claiming banking authority.",
    risk: 28,
    isRisk: false
  },
  {
    time: 12,
    text: "Caller: 'To prevent this transaction, we need to verify your identity. I have triggered a security code to your phone.'",
    observation: "Acoustic spoofing match detected: 42%. Intent pattern match: OTP pre-request.",
    risk: 54,
    isRisk: true
  },
  {
    time: 19,
    text: "Caller: 'Please read the 6-digit OTP code you just received from HDFC instantly, otherwise your account will be permanently blocked.'",
    observation: "Coercion & high-urgency language detected. Social engineering match: High.",
    risk: 86,
    isRisk: true
  },
  {
    time: 26,
    text: "Caller: 'You also need to verify your device. Please open the Google Play Store and search for AnyDesk Support.'",
    observation: "Remote access software request. Threat classification: Vishing Hijack.",
    risk: 98,
    isRisk: true
  }
];

let callInterval: NodeJS.Timeout | null = null;
let secondsCounter = 0;

export function startSimulatedPhoneCall() {
  const store = useAppStore.getState();
  if (store.callActive) return;

  secondsCounter = 0;
  store.startCallSimulation("+91 95382 10928", "HDFC Security Division");
  store.setOverlayActive(true); // Trigger overlay popup immediately

  callInterval = setInterval(() => {
    secondsCounter++;
    store.tickCallDuration();

    // Check if there is an event for this second
    const event = callScenarios.find(s => s.time === secondsCounter);
    if (event) {
      store.addCallObservation(event.text, false);
      setTimeout(() => {
        store.addCallObservation(`[AI Alert] ${event.observation}`, event.isRisk);
        store.updateCallFraudIndex(event.risk);
      }, 1000);
    }

    // End call automatically after scenario runs out
    if (secondsCounter >= 35) {
      stopSimulatedPhoneCall();
    }
  }, 1000);
}

export function stopSimulatedPhoneCall() {
  if (callInterval) {
    clearInterval(callInterval);
    callInterval = null;
  }
  useAppStore.getState().endCallSimulation();
}
