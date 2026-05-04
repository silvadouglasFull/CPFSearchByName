import { InvalidSearchNameError } from '@/getCpfsByName/domain/errors';

export function validateSearchName(searchName: string): void {
    if (!searchName.trim()) {
        throw new InvalidSearchNameError();
    }
}
