import { decryptCpf, encryptCpf } from '@/security/cpf-protection';
import { customType } from 'drizzle-orm/pg-core';

export const encryptedCpf = customType<{ data: string; driverData: string }>({
    dataType() {
        return 'text';
    },
    toDriver(value: string) {
        return encryptCpf(value);
    },
    fromDriver(value: string) {
        return decryptCpf(value);
    },
});