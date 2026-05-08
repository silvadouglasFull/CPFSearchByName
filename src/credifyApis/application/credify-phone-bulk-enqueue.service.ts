import {
    CredifyPhoneJobCreateResult,
    CredifyPhoneJobRepository,
    CredifyPhoneQueueMessage,
} from '@/credifyApis/domain/types';
import { publishCredifyPhoneLookupItem } from '@/queue/rabbitmq/publisher';

type NormalizedPhone = {
    rawPhone: string;
    normalizedPhone: string;
    ddd: string;
    localNumber: string;
    providerQueryId: string;
};

export class CredifyPhoneBulkEnqueueService {
    constructor(private readonly jobRepository: CredifyPhoneJobRepository) { }

    async enqueueSinglePhone(rawPhone: string, createdBy?: string): Promise<CredifyPhoneJobCreateResult> {
        const parsed = this.parsePhone(rawPhone);

        const created = await this.jobRepository.createJob({
            source: 'ui_single',
            createdBy,
            phones: [parsed],
        });

        await this.publishCreatedItems(created);
        return created;
    }

    async enqueueBulkPhones(rawPhones: string[], createdBy?: string): Promise<CredifyPhoneJobCreateResult> {
        const parsedPhones = Array.from(
            new Map(
                rawPhones
                    .map((phone) => this.parsePhone(phone))
                    .map((phone) => [phone.normalizedPhone, phone]),
            ).values(),
        );

        if (parsedPhones.length === 0) {
            throw new Error('At least one valid phone number is required.');
        }

        const created = await this.jobRepository.createJob({
            source: 'api_bulk',
            createdBy,
            phones: parsedPhones,
        });

        await this.publishCreatedItems(created);
        return created;
    }

    parsePhone(rawPhone: string): NormalizedPhone {
        const digits = rawPhone.replace(/\D/g, '');
        const withoutCountry = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;

        if (withoutCountry.length !== 10 && withoutCountry.length !== 11) {
            throw new Error('Phone number must include DDD plus 8 or 9 digits.');
        }

        const ddd = withoutCountry.slice(0, 2);
        const localNumber = withoutCountry.slice(2);

        if (!/^\d{2}$/.test(ddd) || !/^\d{8,9}$/.test(localNumber)) {
            throw new Error('Invalid Brazilian phone number format.');
        }

        return {
            rawPhone,
            normalizedPhone: withoutCountry,
            ddd,
            localNumber,
            providerQueryId: crypto.randomUUID(),
        };
    }

    private async publishCreatedItems(created: CredifyPhoneJobCreateResult): Promise<void> {
        await Promise.all(
            created.items.map((item) => {
                const message: CredifyPhoneQueueMessage = {
                    jobId: created.job.id,
                    itemId: item.id,
                    rawPhone: item.rawPhone,
                    normalizedPhone: item.normalizedPhone,
                    ddd: item.ddd,
                    localNumber: item.localNumber,
                    providerQueryId: item.providerQueryId,
                    attempt: 1,
                };

                return publishCredifyPhoneLookupItem(message);
            }),
        );
    }
}
