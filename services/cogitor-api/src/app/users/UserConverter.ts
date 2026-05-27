import {
  SaveUserProfile,
  UserProfile,
} from '../../../libs/data-access/api.ext.paritet.service/src';
import { HeaderInfoDto } from './dtos/header-info.dto';
import { GetUserProfileDto } from './dtos/output/get.user.profile.dto';
import { AddressDto } from "./dtos/address.dto";

export class UserConverter {
  static convertHeaderInfoFromDatabaseToModel(
    headerInfo: UserProfile,
  ): HeaderInfoDto {
    const info: HeaderInfoDto = {
      id: Number.parseInt(headerInfo.Id),
      login: headerInfo.Login,
      name: headerInfo.Name,
      email: headerInfo.EMail,
      photoImage: {
        fileName: headerInfo?.PhotoImage?.FileName,
        contentType: headerInfo?.PhotoImage?.ContentType,
        binaryContents: headerInfo?.PhotoImage?.BinaryContents,
        description: headerInfo?.PhotoImage?.Description,
      },
    };
    return info;
  }
  static convertUserProfileAddressFromDatabaseToModel(
    userProfile: UserProfile,
  ): GetUserProfileDto {
    const address: AddressDto = {
      country: { id: -1, name: '' },
      region: { id: -1, name: '' },
      city: { id: -1, name: '' },
      street: { id: -1, name: '' },
      house: { id: -1, name: '' },
      flat: { id: -1, name: '' },
    };
    const profile: GetUserProfileDto = {
      id: Number.parseInt(userProfile.Id),
      login: userProfile?.Login,
      name: userProfile?.Name,
      email: userProfile?.EMail,
      phone: userProfile?.Phone,
      sex: userProfile?.Sex,
      photoImage: {
        binaryContents: userProfile?.PhotoImage?.BinaryContents,
        description: userProfile?.PhotoImage?.Description,
        contentType: userProfile?.PhotoImage?.ContentType,
      },
    };
    const addressArray = userProfile?.LivingAddress?.LivingAddressItem;
    for (let i = 0; i < addressArray.length; ++i) {
      if (addressArray[i]?.attributes?.LivingAddressKey == 'CountryId') {
        address.country.id = Number.parseInt(addressArray[i].$value);
      }
      if (addressArray[i].attributes.LivingAddressKey == 'CountryName') {
        address.country.name = addressArray[i].$value;
      }
      if (addressArray[i].attributes.LivingAddressKey == 'RegionId') {
        address.region.id = Number.parseInt(addressArray[i].$value);
      }
      if (addressArray[i].attributes.LivingAddressKey == 'RegionName') {
        address.region.name = addressArray[i].$value;
      }
      if (addressArray[i]?.attributes?.LivingAddressKey == 'CityId') {
        address.city.id = Number.parseInt(addressArray[i].$value);
      }
      if (addressArray[i].attributes.LivingAddressKey == 'CityName') {
        address.city.name = addressArray[i].$value;
      }
      if (addressArray[i].attributes.LivingAddressKey == 'StreetId') {
        address.street.id = Number.parseInt(addressArray[i].$value);
      }
      if (addressArray[i].attributes.LivingAddressKey == 'StreetName') {
        address.street.name = addressArray[i].$value;
      }
      if (addressArray[i].attributes.LivingAddressKey == 'HouseId') {
        address.house.id = Number.parseInt(addressArray[i].$value);
      }
      if (addressArray[i].attributes.LivingAddressKey == 'HouseName') {
        address.house.name = addressArray[i].$value;
      }
      if (addressArray[i].attributes.LivingAddressKey == 'FlatId') {
        address.flat.id = Number.parseInt(addressArray[i].$value);
      }
      if (addressArray[i].attributes.LivingAddressKey == 'FlatName') {
        address.flat.name = addressArray[i].$value;
      }
    }
    profile.livingAddress = address;
    return profile;
  }

  static convertUserProfileAddressFromModelToDatabase(
    userProfile: GetUserProfileDto,
  ): SaveUserProfile {
    const profile: SaveUserProfile = {
      UserId: userProfile.id.toString(),
      UserProfile: {
        Id: userProfile.id.toString(),
        LivingAddress: {
          LivingAddressItem: [
            {
              attributes: {
                LivingAddressKey: 'CountryId',
              },
              $value: userProfile.livingAddress.country.id.toString(),
            },
            {
              attributes: {
                LivingAddressKey: 'CountryName',
              },
              $value: userProfile.livingAddress.country.name,
            },
            {
              attributes: {
                LivingAddressKey: 'RegionId',
              },
              $value: userProfile.livingAddress.region.id.toString(),
            },
            {
              attributes: {
                LivingAddressKey: 'RegionName',
              },
              $value: userProfile.livingAddress.region.name,
            },
            {
              attributes: {
                LivingAddressKey: 'CityId',
              },
              $value: userProfile.livingAddress.city.id.toString(),
            },
            {
              attributes: {
                LivingAddressKey: 'CityName',
              },
              $value: userProfile.livingAddress.city.name,
            },

            {
              attributes: {
                LivingAddressKey: 'StreetId',
              },
              $value: userProfile.livingAddress.street.id.toString(),
            },
            {
              attributes: {
                LivingAddressKey: 'StreetName',
              },
              $value: userProfile.livingAddress.street.name,
            },
            {
              attributes: {
                LivingAddressKey: 'HouseId',
              },
              $value: userProfile.livingAddress.house.id.toString(),
            },
            {
              attributes: {
                LivingAddressKey: 'HouseName',
              },
              $value: userProfile.livingAddress.house.name,
            },
            {
              attributes: {
                LivingAddressKey: 'FlatName',
              },
              $value: userProfile.livingAddress.flat.name,
            },
          ],
        },
      },
      SaveOnlyLivingAddress: '1',
    };
    return profile;
  }
  static convertUserProfileFromModelToDatabase(
    userProfile: GetUserProfileDto,
  ): SaveUserProfile {
    return {
      UserId: userProfile.id.toString(),
      UserProfile: {
        Id: userProfile.id.toString(),
        Login: userProfile.login,
        Name: userProfile.name,
        EMail: userProfile.email,
        Phone: userProfile.phone,
        //	Sex: userProfile.Sex,
        BirthDate: userProfile.birthDate,
        ///	UserPhotoDto: userProfile.UserPhotoDto,
      },
      SaveOnlyLivingAddress: '1',
    };
  }
}
