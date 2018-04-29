import {getImageInfo} from '../';
import config from '../../../config'
describe('Check docker image variations', () => {
    test('check possible docker image variations', () => {

        expect(
            getImageInfo('abc/abc123:1.2.3')
        ).toEqual(
            {registry: config.DOCKER_HUB_REGISTRY, image: 'abc/abc123', version: '1.2.3'}
        );
        expect(
            getImageInfo('abc/abc123:1')
        ).toEqual(
            {registry: config.DOCKER_HUB_REGISTRY, image: 'abc/abc123', version: '1'}
        );

        expect(
            getImageInfo('abc123:1')
        ).toEqual(
            {registry: config.DOCKER_HUB_REGISTRY, image: 'library/abc123', version: '1'}
        );

        expect(
            getImageInfo('abc123')
        ).toEqual(
            {registry: config.DOCKER_HUB_REGISTRY, image: 'library/abc123', version: 'latest'}
        );

        expect(
            getImageInfo('registry.abc.com/abc123')
        ).toEqual(
            {registry: 'registry.abc.com', image: 'abc123', version: 'latest'}
        );

        expect(
            getImageInfo('registry.abc.com/abc123')
        ).toEqual(
            {registry: 'registry.abc.com', image: 'abc123', version: 'latest'}
        );

        expect(
            getImageInfo('registry.abc.com/abc123:1.2.3')
        ).toEqual(
            {registry: 'registry.abc.com', image: 'abc123', version: '1.2.3'}
        );


        expect(
            getImageInfo('registry.example.com/abc123:1.2.3')
        ).toEqual(
            {registry: config.REGISTRY_EXAMPLE_COM_REGISTRY, image: 'abc123', version: '1.2.3'}
        );

    });
});
