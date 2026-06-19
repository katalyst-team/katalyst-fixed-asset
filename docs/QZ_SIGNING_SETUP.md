# QZ Tray Message Signing Setup

## Overview

Implementasi message signing untuk QZ Tray agar menghilangkan popup dialog setiap kali print. Dengan setup ini, user hanya perlu klik "Allow" dan "Remember this decision" sekali saja.

## 📁 Files yang Sudah Dibuat

### 1. **API Endpoint untuk Signing**

- **`src/pages/api/qz/sign-message.ts`** - Server-side signing endpoint

### 2. **Utility & Hooks**

- **`src/utils/qz-signing.ts`** - Utility functions untuk signing
- **`src/hooks/useQZSigning.ts`** - React hook untuk manage signing state

### 3. **Certificate File**

- **`public/digital-certificate.txt`** - Public certificate (sudah ada)

## 🔑 Setup Required

### 1. Copy Private Key

Copy file `private-key.pem` ke project root:

```bash
# Copy private key ke root project
cp /path/to/your/private-key.pem ./private-key.pem

# Pastikan file ada
ls -la private-key.pem
```

### 2. File Structure Check

```
inventory-fe/
├── public/
│   ├── digital-certificate.txt       # ← Public certificate
│   └── private-key.pem               # ← Private key (tidak di-commit)
├── src/
│   ├── pages/api/qz/
│   │   └── sign-message.ts           # ← Signing endpoint
│   ├── hooks/
│   │   └── useQZSigning.ts          # ← Signing hook
│   └── utils/
│       └── qz-signing.ts            # ← Signing utilities
```

**Note**: The API will automatically search for the private key in multiple locations:

- Project root: `private-key.pem`
- Public folder: `public/private-key.pem` ✅ (recommended)
- API folder: `src/pages/api/qz/private-key.pem`

### 3. Update .gitignore

Pastikan private key tidak di-commit:

```bash
echo "private-key.pem" >> .gitignore
```

## 🚀 Integration ke PrintModal

### Option 1: Automatic Integration

Add signing initialization ke `PrintModalV4.tsx`:

```typescript
import { useQZSigning } from "@/hooks/useQZSigning";

const PrintModalV4 = ({ items, onClose }: PrintModalV4Props) => {
  const signing = useQZSigning();

  // Initialize signing saat modal opens
  useEffect(() => {
    if (open) {
      signing.initializeSigning();
    }
  }, [open, signing]);

  // Modify QZ connection status display
  const getConnectionStatus = () => {
    if (signing.signingError) {
      return {
        color: "text-red-600",
        text: `Signing Error: ${signing.signingError}`,
      };
    }

    if (!signing.isSigningInitialized) {
      return { color: "text-orange-600", text: "Initializing Signing..." };
    }

    switch (settings.qzStatus) {
      case "connected":
        return {
          color: "text-green-600",
          text: signing.certificateLoaded
            ? "Connected (Silent Print Ready)"
            : "Connected",
        };
      // ... other cases
    }
  };

  // Rest of component...
};
```

### Option 2: Manual Integration

Add signing controls ke PrintModal UI:

```typescript
{/* Signing Status Section */}
<div className="border rounded-md p-4 space-y-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold">Message Signing</h3>
      <span className={`text-sm ${
        signing.isSigningInitialized
          ? "text-green-600"
          : signing.signingError
            ? "text-red-600"
            : "text-gray-600"
      }`}>
        {signing.isSigningInitialized
          ? "Ready"
          : signing.signingError
            ? "Error"
            : "Not Initialized"
        }
      </span>
    </div>
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={signing.initializeSigning}
        disabled={signing.isSigningInitialized}
      >
        Initialize Signing
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={signing.testConnection}
      >
        Test Connection
      </Button>
    </div>
  </div>

  {signing.signingError && (
    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
      {signing.signingError}
    </div>
  )}
</div>
```

## 🧪 Testing

### 1. Test API Endpoint

```bash
# Test signing endpoint
curl -X POST http://localhost:3000/api/qz/sign-message \
  -H "Content-Type: application/json" \
  -d '{"request":"test message"}'
```

### 2. Test Certificate Access

```bash
# Test certificate is accessible
curl http://localhost:3000/digital-certificate.txt
```

### 3. Test dalam Browser

1. Buka PrintModal
2. Check console untuk signing initialization
3. Connect ke QZ Tray
4. Try print - should not show popup after first "Remember"

## 🔧 Configuration

### Environment Variables (Optional)

```env
# Custom private key path
QZ_PRIVATE_KEY_PATH=/custom/path/to/private-key.pem

# Enable signing debug logs
QZ_SIGNING_DEBUG=true
```

### Production Considerations

1. **Security**: Private key harus secure di server
2. **HTTPS**: Gunakan HTTPS di production
3. **Rate Limiting**: Add rate limiting ke signing endpoint
4. **Monitoring**: Monitor signing failures

## 📋 Troubleshooting

### Common Issues

1. **"Private key not found"**

   ```bash
   # Check file exists dan readable
   ls -la private-key.pem
   chmod 400 private-key.pem
   ```

2. **"Failed to load certificate"**

   ```bash
   # Check certificate accessible
   curl http://localhost:3000/digital-certificate.txt
   ```

3. **"Signing failed"**
   - Check private key format (PKCS#8)
   - Ensure certificate matches private key
   - Check server logs for details

### Debug Mode

Enable debug logging dalam development:

```typescript
// Add to signing hook
const debug = process.env.NODE_ENV === "development";

if (debug) {
  console.log("Signing state:", state);
  console.log("Certificate loaded:", certificateLoaded);
}
```

## 🎯 Expected Behavior

### Before Signing Setup:

- Every print shows popup dialog
- User must click "Allow" setiap kali

### After Signing Setup:

- First print shows popup dengan company info
- User clicks "Allow" + "Remember this decision"
- Subsequent prints: **NO POPUP** (silent printing)

## 📚 References

- [QZ Tray Signing Documentation](https://qz.io/wiki/2.1/message-signing)
- [Certificate Management](https://qz.io/wiki/2.1/certificates)

---

**Setup signing selesai!** 🎉 Silent printing ready untuk production.
